import { AnyArray } from '../../arrays/types';
import { Fn } from '../types';

type PartialCall_F = <
  T extends AnyArray = AnyArray,
  U extends AnyArray = AnyArray,
  R = any,
>(
  f: Fn<[...T, ...U], R>,
  ...headArgs: T
) => (...tailArgs: U) => R;

/**
 * partialCall variable - Auto-generated expression
 * 
 * ⚠️ WARNING: This expression is auto-generated and should not be modified.
 * Any manual changes will be overwritten during the next generation.
 * 
 * @generated
 * @readonly
 * @author chlbri (bri_lvi@icloud.com)
 */
export const partialCall: PartialCall_F = (f, ...headArgs) => {
  return (...tailArgs) => f(...headArgs, ...tailArgs);
};

    