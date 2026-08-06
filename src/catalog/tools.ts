import type { Href } from 'expo-router';

export type ToolStatus = 'available' | 'coming_soon';

export interface CalculatorTool {
  id: string;
  title: string;
  status: ToolStatus;
  href: Href;
}

/** Items del menú hamburguesa (inicio = termomagnéticas). */
export const MENU_TOOLS: CalculatorTool[] = [
  {
    id: 'thermomagnetic',
    title: 'Termomagnéticas',
    status: 'available',
    href: '/',
  },
  {
    id: 'cable-section',
    title: 'Sección de cable',
    status: 'available',
    href: '/calculators/cable-section',
  },
  {
    id: 'voltage-drop',
    title: 'Caída de tensión',
    status: 'available',
    href: '/calculators/voltage-drop',
  },
  {
    id: 'power',
    title: 'Potencia eléctrica',
    status: 'available',
    href: '/calculators/power',
  },
  {
    id: 'help',
    title: 'Ayuda y normas',
    status: 'available',
    href: '/help',
  },
];
