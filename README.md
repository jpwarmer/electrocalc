# ElectroCalc

App móvil **offline** (Expo SDK 54 / React Native) para dimensionar interruptores termomagnéticos según **AEA 90364**, **IRAM** e **IEC 60898**.

Compatible con **Expo Go** de Play Store (SDK 54).

## Arranque

```bash
npm install
npm start
```

## Tests del motor

```bash
npm test
```

## Estructura

- `src/data/` — tablas normativas JSON embebidas
- `src/engines/thermomagnetic/` — motor de cálculo (Ib → In → Iz′ → ΔU → Icn)
- `src/catalog/tools.ts` — catálogo extensible de herramientas
- `app/calculators/thermomagnetic.tsx` — UI de la calculadora

## Alcance

- Termomagnéticas / protecciones (AEA 90364 · IEC 60898)
- Sección de cable PVC/XLPE (AEA 90364 / IEC 60364-5-52)
- Caída de tensión (límite 3%/5%)
- Potencia eléctrica (W ↔ V ↔ A)

Otras calculadoras se agregan como entradas en `src/catalog/tools.ts`.
