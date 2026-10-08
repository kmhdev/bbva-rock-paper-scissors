import { RandomMachineStrategy, SmartMachineStrategy } from './machineService';

/**
 * Singletons de estrategia compartidos que usa la vista de juego.
 * Los tests pueden mockear este módulo para una máquina determinista.
 */
export const randomMachineStrategy = new RandomMachineStrategy();
export const smartMachineStrategy = new SmartMachineStrategy();
