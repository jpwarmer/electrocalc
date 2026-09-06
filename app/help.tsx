import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import conductors from '@/src/data/conductors-pvc70.json';
import tempFactors from '@/src/data/cable-temperature-factors.json';
import { Accordion } from '@/src/components/help/Accordion';
import {
  Bullet,
  Callout,
  DataTable,
  FormulaBox,
  FormulaRow,
  HelpBold,
  HelpText,
  SectionLabel,
} from '@/src/components/help/HelpBlocks';
import { colors, fonts, space } from '@/src/theme';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

export default function HelpScreen() {
  const coordRows = conductors.conductors.map((c) => [
    c.sectionMm2,
    c.izMono,
    c.izTri,
    c.maxIn,
  ]);

  const pvcTempRows = tempFactors.pvc.map((r) => [
    `${r.ambientC}°C`,
    r.factor.toFixed(2) + (r.ambientC === 30 ? ' (ref.)' : ''),
  ]);

  const xlpeTempRows = tempFactors.xlpe.map((r) => [
    `${r.ambientC}°C`,
    r.factor.toFixed(2) + (r.ambientC === 30 ? ' (ref.)' : ''),
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          Referencia de cómo ElectroCalc calcula y qué normas aplica. Tocá cada
          título para expandir.
        </Text>

        <Group title="Termomagnéticas">
          <Accordion title="Cómo calcular una llave térmica" defaultOpen>
            <HelpText>
              Calcular la llave térmica correcta es clave para la seguridad y el
              cumplimiento de <HelpBold>AEA 90364</HelpBold>. En Argentina también
              se la llama interruptor termomagnético o breaker.
            </HelpText>
            <HelpText>
              La regla de oro de coordinación (AEA 90364-4-43) es:
            </HelpText>
            <FormulaBox>Ib ≤ In ≤ Iz</FormulaBox>
            <HelpText>
              Corriente de diseño ≤ calibre del interruptor ≤ ampacidad del cable.
            </HelpText>
          </Accordion>

          <Accordion title="Fórmula de corriente (monofásico 220 V)">
            <HelpText>
              Base para circuitos monofásicos 220 V:
            </HelpText>
            <FormulaBox>I (A) = P (W) ÷ V (V) ÷ FP</FormulaBox>
            <Bullet>
              <HelpBold>I</HelpBold> = corriente de diseño (Ib)
            </Bullet>
            <Bullet>
              <HelpBold>P</HelpBold> = potencia en watts
            </Bullet>
            <Bullet>
              <HelpBold>V</HelpBold> = tensión (220 V mono / 380 V tri)
            </Bullet>
            <Bullet>
              <HelpBold>FP</HelpBold> = factor de potencia (cos φ)
            </Bullet>
            <HelpText>
              En trifásico: I = P ÷ (√3 × V × FP).
            </HelpText>
          </Accordion>

          <Accordion title="Tamaños normalizados (IEC 60898 / IRAM)">
            <HelpText>
              Según IEC 60898 e IRAM, los calibres normalizados en Argentina son:{' '}
              <HelpBold>
                6A, 10A, 16A, 20A, 25A, 32A, 40A, 50A, 63A, 80A y 100A
              </HelpBold>
              .
            </HelpText>
            <HelpText>
              Siempre se selecciona el tamaño <HelpBold>inmediato superior</HelpBold>{' '}
              al valor calculado. Para tableros principales residenciales
              (80A–100A), verificá con el distribuidor local (Edesur, Edenor,
              cooperativas) el poder de corte exigido.
            </HelpText>
          </Accordion>

          <Accordion title="Normas AEA 90364 (protecciones)">
            <Bullet>
              <HelpBold>AEA 90364-4-43:</HelpBold> coordinación Ib ≤ In ≤ Iz.
            </Bullet>
            <Bullet>
              <HelpBold>AEA 90364-4-42:</HelpBold> protección de motores — relé
              térmico independiente obligatorio (la térmica sola no alcanza).
            </Bullet>
            <Bullet>
              <HelpBold>AEA 90364-7-53:</HelpBold> selección e instalación de
              equipos de protección.
            </Bullet>
            <Bullet>
              <HelpBold>AEA 90364-4-41 / 7-771:</HelpBold> diferencial 30 mA
              obligatorio en circuitos terminales; poder de corte (Icn).
            </Bullet>
            <Bullet>
              <HelpBold>IEC 60898-1:</HelpBold> curvas B / C / D de disparo
              magnético.
            </Bullet>
          </Accordion>
        </Group>

        <Group title="Sección de cable">
          <Accordion title="Normas argentinas para cables">
            <Callout title="AEA 90364 / IEC 60364-5-52 — Instalaciones eléctricas" tone="green">
              Reglamentación vigente para instalaciones de baja tensión en
              Argentina. Define métodos de instalación, factores de corrección,
              secciones mínimas y coordinación cable-protección.
            </Callout>
            <Callout title="IRAM 2183 — Conductores eléctricos" tone="blue">
              Norma histórica argentina (base 40°C). Sus valores de ampacidad son
              más conservadores que AEA 90364 (base 30°C): 13A / 18A / 24A para
              1.5 / 2.5 / 4 mm². Esta calculadora usa los valores AEA 90364.
            </Callout>
          </Accordion>

          <Accordion title="Factores de corrección por temperatura">
            <HelpText>
              IEC 60364-5-52 Tabla B.52.14 — base 30°C.
            </HelpText>
            <SectionLabel>PVC 70°C</SectionLabel>
            <DataTable headers={['Ambiente', 'Factor']} rows={pvcTempRows} />
            <SectionLabel>XLPE 90°C</SectionLabel>
            <DataTable headers={['Ambiente', 'Factor']} rows={xlpeTempRows} />
            <HelpText>
              También se aplican factores de método de instalación y de
              agrupamiento (circuitos en la misma cañería).
            </HelpText>
          </Accordion>

          <Accordion title="Coordinación cable–térmica">
            <HelpText>
              Valores prácticos (AEA + IEC 60364-5-52 B.52.2, Cu PVC 70°C, Mét.
              B1, 30°C). Columna «máx.» = In máx. donde In ≤ Iz.
            </HelpText>
            <DataTable
              headers={['Cable', 'Iz mono', 'Iz tri', 'Térm. máx.']}
              rows={coordRows}
              emphasizeFirst
              emphasizeLast
            />
          </Accordion>
        </Group>

        <Group title="Caída de tensión">
          <Accordion title="Fórmulas de ΔU">
            <FormulaRow label="Monofásico" icon="⌂" formula="ΔU = 2 · I · L · ρ / S" />
            <HelpText>Factor 2 por ida y vuelta de corriente.</HelpText>
            <FormulaRow label="Trifásico" icon="🏭" formula="ΔU = √3 · I · L · ρ / S" />
            <HelpText>Factor √3 (1.732) para sistemas trifásicos.</HelpText>
            <FormulaBox>ΔU% = (ΔU / Vn) × 100</FormulaBox>
          </Accordion>

          <Accordion title="Límites AEA 90364">
            <Bullet>
              <HelpBold>3%</HelpBold> máximo en circuitos de iluminación y
              tomacorrientes.
            </Bullet>
            <Bullet>
              <HelpBold>5%</HelpBold> máximo total desde el medidor hasta
              cualquier punto de utilización.
            </Bullet>
            <Bullet>
              Para motores se permite hasta <HelpBold>5%</HelpBold> en el
              circuito individual.
            </Bullet>
          </Accordion>

          <Accordion title="Resistividad de conductores (ρ)">
            <HelpText>
              Valores a 70°C (temperatura de operación PVC), más realistas que
              20°C:
            </HelpText>
            <Bullet>
              <HelpBold>Cobre:</HelpBold> 0.0225 Ω·mm²/m (0.0175 a 20°C)
            </Bullet>
            <Bullet>
              <HelpBold>Aluminio:</HelpBold> 0.036 Ω·mm²/m (0.028 a 20°C)
            </Bullet>
          </Accordion>
        </Group>

        <Group title="Potencia eléctrica">
          <Accordion title="Fórmulas de potencia eléctrica" defaultOpen>
            <HelpText>
              La <HelpBold>potencia eléctrica</HelpBold> mide la energía
              consumida por unidad de tiempo, en <HelpBold>Watts (W)</HelpBold>.
            </HelpText>
            <FormulaRow label="DC" icon="🔋" formula="P = V × I" />
            <FormulaRow
              label="AC mono"
              icon="⌂"
              formula="P = V × I × cos(φ)"
            />
            <FormulaRow
              label="AC tri"
              icon="🏭"
              formula="P = √3 × V × I × cos(φ)"
            />
          </Accordion>

          <Accordion title="Factor de potencia (cos φ)">
            <Bullet>
              <HelpBold>1.0:</HelpBold> cargas resistivas (calefactores, duchas)
            </Bullet>
            <Bullet>
              <HelpBold>0.85–0.90:</HelpBold> motores eléctricos
            </Bullet>
            <Bullet>
              <HelpBold>0.60–0.70:</HelpBold> fluorescentes sin compensar
            </Bullet>
            <HelpText>
              En DC no aplica (se asume 1). Un FP bajo implica más corriente para
              la misma potencia útil.
            </HelpText>
          </Accordion>
        </Group>

        <Group title="Frigorías / HP → corriente">
          <Accordion title="Frigorías y calorías a amperios">
            <HelpText>
              Las frigorías (fg) suelen ser capacidad térmica en kcal/h, no
              consumo eléctrico.
            </HelpText>
            <FormulaBox>P = (fg × 1.163) / COP</FormulaBox>
            <HelpText>
              Luego I = P / (V × cos φ) en monofásico. COP típico de A·A: 2.5–3.5.
            </HelpText>
          </Accordion>

          <Accordion title="HP a amperios">
            <FormulaBox>P = (HP × 746) / η</FormulaBox>
            <HelpText>
              1 HP = 746 W mecánicos. η típico 0.80–0.90. En trifásico: I = P /
              (√3 × V × cos φ).
            </HelpText>
          </Accordion>
        </Group>

        <Group title="Referencia cable–ITM">
          <Accordion title="Tabla rápida de coordinación">
            <HelpText>
              Relación práctica Cu PVC 70°C, Mét. B1, 30°C. Ejemplo: 1.5 mm² →
              ITM 6–10 A; 2.5 mm² → 16–20 A. Siempre In ≤ Iz.
            </HelpText>
            <HelpText>
              Usá la pantalla «Referencia cable–ITM» del menú para ver todas las
              secciones comerciales.
            </HelpText>
          </Accordion>
        </Group>

        <Text style={styles.disclaimer}>
          Resultados orientativos. Verificá siempre con un electricista
          matriculado y las normas AEA 90364 / IRAM vigentes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: space.md,
    gap: space.lg,
    paddingBottom: space.xxl,
  },
  intro: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  group: { gap: space.sm },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  groupBody: { gap: 10 },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.inkMuted,
  },
});
