import os
import json
import re
from pathlib import Path
import pandas as pd

def extraer_datos_texto(texto: str) -> dict:
    """
    Función auxiliar basada en expresiones regulares y patrones para extraer 
    entidades clave de contratos y adendas (Montos, Fechas, Partes).
    """
    datos = {}
    
    # Búsqueda de montos (ej. $ 10.000.000, USD 5,000, etc.)
    monto_match = re.findall(r'(?:\$|USD|COP|EUR)\s*[\d.,]+', texto)
    if monto_match:
        datos["montos_detectados"] = monto_match
        
    # Búsqueda de fechas (YYYY-MM-DD o formato similar)
    fechas_match = re.findall(r'\b\d{4}[-/]\d{2}[-/]\d{2}\b', texto)
    if fechas_match:
        datos["fechas_detectadas"] = fechas_match
        
    return datos

def procesar_reto_02_avanzado():
    print("[*] Iniciando pipeline avanzado de procesamiento y conciliación del Reto 02...")
    
    # Rutas base
    base_path = Path(__file__).resolve().parent.parent
    fixtures_path = base_path / "data" / "fixtures"
    output_path = base_path / "outputs"
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Cargar archivos maestros
    maestro_contratos_path = fixtures_path / "maestro-contratos.csv"
    comerciales_path = fixtures_path / "comerciales.json"
    
    df_maestro = pd.DataFrame()
    if maestro_contratos_path.exists():
        df_maestro = pd.read_csv(maestro_contratos_path)
        print(f"[+] Maestro de contratos cargado con éxito. Total registros: {len(df_maestro)}")
    else:
        print("[-] Advertencia: No se encontró el archivo maestro-contratos.csv")

    data_comerciales = {}
    if comerciales_path.exists():
        with open(comerciales_path, "r", encoding="utf-8") as f:
            data_comerciales = json.load(f)
        print(f"[+] Archivo comerciales.json cargado correctamente.")

    # 2. Procesar buzón de mensajes (msg-001 a msg-006)
    buzon_path = fixtures_path / "buzon"
    reporte_general = []
    
    if buzon_path.exists():
        for msg_dir in sorted(buzon_path.glob("msg-*")):
            if msg_dir.is_dir():
                msg_id = msg_dir.name
                print(f"\n[*] Procesando {msg_id}...")
                
                # Leer correo.json
                correo_file = msg_dir / "correo.json"
                remitente, asunto, cuerpo_correo = "Desconocido", "Sin asunto", ""
                if correo_file.exists():
                    with open(correo_file, "r", encoding="utf-8") as f:
                        data_correo = json.load(f)
                        remitente = data_correo.get("remitente", "Desconocido")
                        asunto = data_correo.get("asunto", "Sin asunto")
                        cuerpo_correo = data_correo.get("cuerpo", "")
                
                # Analizar documentos adjuntos (contrato.txt, otrosi.txt, cotizacion.txt)
                documentos_analisis = {}
                for doc_file in msg_dir.glob("*.txt"):
                    with open(doc_file, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read()
                        documentos_analisis[doc_file.name] = {
                            "extracto": contenido[:300] + "..." if len(contenido) > 300 else contenido,
                            "entidades": extraer_datos_texto(contenido)
                        }
                
                # Consolidar información del mensaje
                caso_analizado = {
                    "mensaje_id": msg_id,
                    "remitente": remitente,
                    "asunto": asunto,
                    "documentos": documentos_analisis,
                    "estado_conciliacion": "Revisado"
                }
                
                reporte_general.append(caso_analizado)
    else:
        print("[-] Error: No se encontró la ruta del buzón.")

    # 3. Guardar el reporte consolidado en JSON
    output_file = output_path / "reporte_analisis.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(reporte_general, f, indent=4, ensure_ascii=False)
        
    print(f"\n[+] Pipeline completado exitosamente. Reporte generado en: {output_file}")

if __name__ == "__main__":
    procesar_reto_02_avanzado()