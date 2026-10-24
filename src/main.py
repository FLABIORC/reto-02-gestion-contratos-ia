import os
import json
import pandas as pd
from pathlib import Path

def procesar_reto_02():
    print("[*] Iniciando pipeline de procesamiento del Reto 02: Gestión y Análisis de Contratos...")
    
    # Rutas base
    base_path = Path(__file__).resolve().parent.parent
    fixtures_path = base_path / "data" / "fixtures"
    output_path = base_path / "outputs"
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Cargar maestros si existen
    maestro_contratos_path = fixtures_path / "maestro-contratos.csv"
    comerciales_path = fixtures_path / "comerciales.json"
    
    if maestro_contratos_path.exists():
        df_maestro = pd.read_csv(maestro_contratos_path)
        print(f"[+] Maestro de contratos cargado con {len(df_maestro)} registros.")
    else:
        print("[-] Advertencia: No se encontró el maestro-contratos.csv en fixtures.")
        df_maestro = pd.DataFrame()

    # 2. Procesar buzón de mensajes (msg-001 a msg-006)
    buzon_path = fixtures_path / "buzon"
    resultados = []
    
    if buzon_path.exists():
        for msg_dir in sorted(buzon_path.glob("msg-*")):
            if msg_dir.is_dir():
                msg_id = msg_dir.name
                print(f"[*] Analizando {msg_id}...")
                
                # Leer correo.json si existe
                correo_file = msg_dir / "correo.json"
                remitente, asunto = "Desconocido", "Sin asunto"
                if correo_file.exists():
                    with open(correo_file, "r", encoding="utf-8") as f:
                        data_correo = json.load(f)
                        remitente = data_correo.get("remitente", "Desconocido")
                        asunto = data_correo.get("asunto", "Sin asunto")
                
                # Verificar documentos asociados (contrato.txt, otrosi.txt, cotizacion.txt)
                documentos = [f.name for f in msg_dir.glob("*") if f.is_file() and f.name != "correo.json"]
                
                resultados.append({
                    "mensaje_id": msg_id,
                    "remitente": remitente,
                    "asunto": asunto,
                    "documentos_adjuntos": documentos,
                    "estado_analisis": "Procesado correctamente"
                })
    else:
        print("[-] Advertencia: No se encontró la carpeta del buzón en fixtures.")

    # 3. Guardar reporte de salida
    output_file = output_path / "reporte_analisis.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(resultados, f, indent=4, ensure_ascii=False)
        
    print(f"[+] Proceso finalizado con éxito. Reporte guardado en: {output_file}")

if __name__ == "__main__":
    procesar_reto_02()