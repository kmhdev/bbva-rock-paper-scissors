import { RandomMachineStrategy, SmartMachineStrategy } from './machineService';

/**
 * Shared strategy singletons used by the game view.
 * Tests can jest.mock this module to make the machine deterministic.
 */
export const randomMachineStrategy = new RandomMachineStrategy();
export const smartMachineStrategy = new SmartMachineStrategy();
