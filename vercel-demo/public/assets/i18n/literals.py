import pandas as pd
import json

# Reemplaza 'ruta_del_archivo.xlsx' con la ruta completa de tu archivo de Excel
archivo_excel = pd.read_excel('Fiduciary_Interface_translation_literals_v4.xlsx')

# Selecciona las columnas 1, 4, 5, 6 y 7 (LiteralCode, English translation, Spanish Translation, Portuguese Translation, French Translation)
columnas_deseadas = [0, 3, 4, 5, 6]  # Índices de las columnas deseadas
valores_columnas = archivo_excel.iloc[1:, columnas_deseadas]

# Reemplaza los valores NaN (celdas vacías) con una cadena vacía ("")
valores_columnas = valores_columnas.fillna("")

# Elimina el prefijo "FI.CNVG.FP" de los valores en las celdas
valores_columnas = valores_columnas.apply(
    lambda x: x.str.replace(r'^FI\.CNVG\.FP\.', '', regex=True)
)

# Crear una lista de listas con los valores de las columnas
data = valores_columnas.values.tolist()

# Crear un diccionario para cada idioma
idiomas = {
    "en.json": "English translation",
    "es.json": "Spanish Translation",
    "pt.json": "Portuguese Translation",
    "fr.json": "French Translation"
}

for archivo, idioma_columna in idiomas.items():
    resultado = {}
    for elemento in data:
        resultado[elemento[0]] = (
            elemento[1] if idioma_columna == "English translation" else
            elemento[2] if idioma_columna == "Spanish Translation" else
            elemento[3] if idioma_columna == "Portuguese Translation" else
            elemento[4]
        )

    # Convertir el diccionario a JSON, ordenando las claves alfabéticamente con una indentación de 2 espacios
    json_resultado = json.dumps(
        resultado, indent=2, ensure_ascii=False, sort_keys=True
    )

    # Agregar un salto de línea al final del JSON antes de guardarlo
    json_resultado += '\n'

    # Guardar el JSON en un archivo con codificación UTF-8
    with open(archivo, 'w', encoding='utf-8') as archivo_json:
        archivo_json.write(json_resultado)

    print(f"Archivo '{archivo}' generado con éxito.")
