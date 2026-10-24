import os
import json
import re
from pathlib import Path
import pandas as pd

def extraer_datos_texto(texto: str) -> dict:
    """
    Extrae montos, fechas y códigos de contrato utilizando expresiones regulares.
    """
    datos = {}
    
    # Búsqueda de montos (ej. $ 265.000.000, USD 120,000.00, COP 32.000.000)
    monto_match = re.findall(r'(?:\$|USD|COP|EUR)\s*[\d.,]+', texto)
    if monto_match:
        datos["montos_detectados"] = monto_match
        
    # Búsqueda de fechas (YYYY-MM-DD o similar)
    fechas_match = re.findall(r'\b\d{4}[-/]\d{2}[-/]\d{2}\b', texto)
    if fechas_match:
        datos["fechas_detectadas"] = fechas_match
        
    # Búsqueda de códigos de contrato (ej. CT-2026-015, CM-2026-03)
    contratos_match = re.findall(r'\b(?:CT|CM)-\d{4}-\d+\b', texto)
    if contratos_match:
        datos["codigos_contrato_detectados"] = list(set(contratos_match))
        
    return datos

def procesar_reto_02_completo():
    print("[*] Iniciando pipeline completo de procesamiento y conciliación del Reto 02...")
    
    base_path = Path(__file__).resolve().parent.parent
    fixtures_path = base_path / "data" / "fixtures"
    output_path = base_path / "outputs"
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Cargar archivo maestro de contratos
    maestro_contratos_path = fixtures_path / "maestro-contratos.csv"
    df_maestro = pd.DataFrame()
    if maestro_contratos_path.exists():
        df_maestro = pd.read_csv(maestro_contratos_path)
        print(f"[+] Maestro de contratos cargado con éxito. Total registros: {len(df_maestro)}")
    else:
        print("[-] Advertencia: No se encontró el archivo maestro-contratos.csv")

    # 2. Procesar buzón de mensajes (msg-001 a msg-006)
    buzon_path = fixtures_path / "buzon"
    reporte_general = []
    
    if buzon_path.exists():
        for msg_dir in sorted(buzon_path.glob("msg-*")):
            if msg_dir.is_dir():
                msg_id = msg_dir.name
                print(f"[*] Analizando {msg_id}...")
                
                # Leer correo.json de forma robusta
                correo_file = msg_dir / "correo.json"
                remitente, asunto = "No especificado", "Sin asunto"
                if correo_file.exists():
                    with open(correo_file, "r", encoding="utf-8") as f:
                        data_correo = json.load(f)
                        remitente = data_correo.get("remitente") or data_correo.get("de") or data_correo.get("from") or "No especificado"
                        asunto = data_correo.get("asunto") or data_correo.get("subject") or "Sin asunto"
                
                # Analizar documentos adjuntos (contrato.txt, otrosi.txt, cotizacion.txt)
                documentos_analisis = {}
                codigos_encontrados = []
                for doc_file in msg_dir.glob("*.txt"):
                    with open(doc_file, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read()
                        entidades = extraer_datos_texto(contenido)
                        documentos_analisis[doc_file.name] = {
                            "extracto": contenido[:300] + "..." if len(contenido) > 300 else contenido,
                            "entidades": entidades
                        }
                        if "codigos_contrato_detectados" in entidades:
                            codigos_encontrados.extend(entidades["codigos_contrato_detectados"])
                
                # 3. Cruce y Conciliación con el Maestro de Contratos
                conciliacion_status = "Conciliado correctamente"
                detalles_maestro = []
                if not df_maestro.empty and codigos_encontrados:
                    for codigo in set(codigos_encontrados):
                        # Buscar coincidencia del código en el DataFrame maestro
                        match = df_maestro[df_maestro.astype(str).apply(lambda x: x.str.contains(codigo, case=False)).any(axis=1)]
                        if not match.empty:
                            detalles_maestro.append(match.to_dict(orient="records"))
                        else:
                            conciliacion_status = f"Discrepancia: Código {codigo} no registrado en el maestro"
                else:
                    if not codigos_encontrados:
                        conciliacion_status = "Revisión manual requerida (Sin código formal detectado)"

                caso_analizado = {
                    "mensaje_id": msg_id,
                    "remitente": remitente,
                    "asunto": asunto,
                    "documentos": documentos_analisis,
                    "codigos_contrato_detectados": list(set(codigos_encontrados)),
                    "cruce_maestro": detalles_maestro if detalles_maestro else "Sin coincidencia en maestro",
                    "estado_conciliacion": conciliacion_status
                }
                
                reporte_general.append(caso_analizado)
    else:
        print("[-] Error: No se encontró la ruta del buzón.")

    # Guardar reporte consolidado en JSON
    output_file = output_path / "reporte_analisis.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(reporte_general, f, indent=4, ensure_ascii=False)
        
    print(f"[+] Pipeline completo ejecutado. Reporte generado en: {output_file}")

if __name__ == "__main__":
    procesar_reto_02_completo()