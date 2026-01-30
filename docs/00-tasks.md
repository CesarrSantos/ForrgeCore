# Lista de tareas derivadas del GDD

## 0. Base del proyecto
- Crear estructura de carpetas y archivos base
- Configurar `index.html` con Phaser
- Configurar escena de arranque y escena principal

## 1. Minijuego de timing (core)
- Implementar barra oscilante y zona Perfect
- Definir resultados: Miss/Good/Perfect
- Calcular chispas por resultado
- Añadir feedback visual y textual
- Exponer variables de tuning (velocidad, tamaño de zona, multiplicadores)

## 2. Recursos y economía inicial
- Definir modelo de recursos (Chispas, Monedas, Energía)
- Implementar conversión Chispas → Monedas/Energía
- Mostrar recursos en HUD
- Guardar/balancear valores iniciales

## 3. Upgrades básicos
- Estructura de datos para upgrades
- UI de compra rápida
- Aplicar upgrades al minijuego y a recursos
- Persistencia de upgrades

## 4. Sistema Idle
- Tick base (1s) con generadores
- Producción pasiva de Monedas/Energía
- Multiplicadores globales
- Integración con progreso activo

## 5. Guardado y progreso offline
- Guardado local (localStorage)
- Cálculo de progreso offline
- Manejo de versiones de save

## 6. Skill tree
- Definir ramas y nodos
- UI del árbol
- Aplicar efectos de nodos
- Desbloqueos y costes

## 7. Ascensión (Reinicio del Núcleo)
- Umbral y condiciones de ascensión
- Reset parcial con perks permanentes
- Generación de Fragmentos de Núcleo
- UI y confirmaciones

## 8. Contenido meta
- Eventos de corta duración
- Buffs temporales
- Artefactos

## 9. UI/UX y pulido
- Layout final del HUD
- Indicadores claros de estado
- Ajustes para móvil
- Sonido y feedback

## 10. Testing y balance
- Pruebas de loop de 30–90s
- Ajuste de economía y progresión
- Pruebas de guardado/offline
