# README.md

## Forja del Núcleo — Idle / Incremental con Minijuego de Timing

Este repositorio define el diseño, arquitectura y plan de desarrollo del juego **Forja del Núcleo**, un idle/incremental híbrido desarrollado con **HTML + JavaScript + Phaser.js**.

El objetivo del README es servir como **mapa maestro** del proyecto: qué contiene cada carpeta, qué documentos existen y cómo encaja todo el sistema.

---

## 📁 Estructura del proyecto

```
forja-del-nucleo/
├── index.html
├── src/
│   ├── core/          # Lógica base del juego
│   ├── scenes/        # Escenas Phaser
│   ├── systems/       # Sistemas (idle, recursos, guardado)
│   ├── ui/            # HUD y overlays
│   └── data/          # Configuración (árboles, upgrades)
├── assets/
│   ├── sprites/
│   ├── ui/
│   └── audio/
├── docs/
│   ├── 01-core-loop.md
│   ├── 02-minigame.md
│   ├── 03-resources.md
│   ├── 04-skill-tree.md
│   ├── 05-idle-system.md
│   ├── 06-prestige.md
│   ├── 07-ui-ux.md
│   └── 08-roadmap.md
└── README.md
```

---

## 🧠 Filosofía de diseño

- Loop corto, claro y satisfactorio
- Minijuego activo que **potencia el idle**
- Idle que **mejora la experiencia activa**
- Progresión en capas (skill tree + prestige)
- Complejidad creciente, inputs simples

---

## 📄 docs/01-core-loop.md

### Core Loop del Juego

1. El jugador ejecuta el **minijuego de forja (timing)**
2. Genera **Chispas**
3. Las Chispas se convierten en **Monedas** y **Energía**
4. Con esos recursos compra mejoras
5. Las mejoras hacen el minijuego más rentable
6. El idle mantiene progreso pasivo
7. Al llegar a cierto umbral → **Ascensión**

Loop ideal: 30–90 segundos por ciclo activo.

---

## 📄 docs/02-minigame.md

### Minijuego: Golpes de Forja

**Tipo:** Timing / Click

**Mecánica base:**
- Barra oscilante horizontal
- Zona "Perfect" en el centro
- Click dentro de la zona → éxito

**Resultados:**
- Miss → 0 chispas
- Good → chispas base
- Perfect → chispas x multiplicador

**Mejoras posibles:**
- Ancho de zona Perfect
- Velocidad de la barra
- Combo de perfects
- Críticos

---

## 📄 docs/03-resources.md

### Recursos del juego

#### Tier 1
- **Monedas**: recurso base
- **Chispas**: output del minijuego
- **Energía**: desbloqueos y upgrades

#### Tier 2
- **Aleaciones**: crafting incremental
- **Planos**: desbloqueos raros

#### Tier 3
- **Fragmentos de Núcleo**: moneda de Ascensión

Cada recurso cumple una función clara para evitar inflación confusa.

---

## 📄 docs/04-skill-tree.md

### Árbol de habilidades

Estructura tipo "prestige tree": nodos interconectados y ramas claras.

#### Rama Maestría (Activo)
- Timing
- Combos
- Críticos

#### Rama Industria (Idle)
- Monedas/s
- Generadores
- Sinergias

#### Rama Arcana (Meta)
- Multiplicadores globales
- Offline progress
- Conversión eficiente

#### Nodos puente
- Idle → activo
- Activo → idle

---

## 📄 docs/05-idle-system.md

### Sistema Idle

- Tick base: 1 segundo
- Producción basada en generadores
- Escala con multiplicadores
- Afectado por progreso activo

Incluye:
- Progreso offline
- Buffs temporales
- Eventos de corta duración

---

## 📄 docs/06-prestige.md

### Sistema de Ascensión

Nombre: **Reinicio del Núcleo**

Al ascender:
- Reset parcial de recursos
- Se conservan perks permanentes
- Se gana Fragmentos de Núcleo

Objetivo: acelerar el early game y desbloquear capas nuevas.

---

## 📄 docs/07-ui-ux.md

### UI / UX

**Pantalla principal:**
- Centro: minijuego
- Arriba: recursos
- Derecha: upgrades rápidos
- Izquierda: botón Árbol
- Abajo: Ascensión

Diseño pensado para desktop y móvil.

---

## 📄 docs/08-roadmap.md

### Roadmap de desarrollo

#### Fase 1 — MVP
- Minijuego funcional
- Recursos básicos
- Guardado local

#### Fase 2 — Progresión
- Idle system
- Upgrades
- Skill tree

#### Fase 3 — Meta
- Ascensión
- Eventos
- Artefactos

---

## ✅ Próximo paso

1. Crear estructura Phaser
2. Implementar minijuego
3. Tick idle + guardado

Este documento es la referencia central del proyecto.

