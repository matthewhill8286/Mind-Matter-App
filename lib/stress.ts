import { StressKit, StressCompletion, DEFAULT_KIT } from './types';

/**
 * @deprecated Use useStressStore().stressKit or useStressStore().fetchStressKit()
 */
export async function getStressKit(): Promise<StressKit> {
  return DEFAULT_KIT;
}

/**
 * @deprecated Use useStressStore().saveStressKit()
 */
export async function saveStressKit(kit: StressKit): Promise<StressKit> {
  throw new Error('Deprecated. Use useStressStore().saveStressKit() instead.');
}

/**
 * @deprecated Use useActivityStore().stressHistory or useActivityStore().fetchStressHistory()
 */
export async function listStressHistory(): Promise<StressCompletion[]> {
  return [];
}

/**
 * @deprecated Use useActivityStore().addStressCompletion()
 */
export async function addStressCompletion(
  exerciseId: string,
  title: string,
): Promise<StressCompletion> {
  throw new Error('Deprecated. Use useActivityStore().addStressCompletion() instead.');
}
