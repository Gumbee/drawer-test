import { useContext, useMemo } from "react";

import {
  DEFAULT_SHEET_STATE,
  SheetActions,
  SheetContext,
  SheetContextState,
} from "../context";

type DerivedSheetContextState<T = unknown> = {
  currentContent: SheetContextState<T>["stack"][number];
};

// scope a function to the environment (first argument set) and return resulting function
const scopeToEnvironment = <Q, T extends any[], R>(
  env: Q,
  fn: (env: Q, ...rest: T) => R
) => {
  return (...moreArgs: T): R => {
    return fn(env, ...moreArgs);
  };
};

// it's a pain in the ass to redefine define all the scope action types in Typescript, so we just infer this one
const useSheet = <T,>(environment: string) => {
  const state = useContext(SheetContext);
  const isolated = (state.state[environment] ??
    DEFAULT_SHEET_STATE) as SheetContextState<T>;
  const actions = state.actions as SheetActions<T>;

  const derived = {
    currentContent:
      isolated.stack.length > 0
        ? isolated.stack[isolated.stack.length - 1]
        : undefined,
  };

  const scoped = useMemo(() => {
    return {
      closeSheet: scopeToEnvironment(environment, actions.closeSheet),
      goBack: scopeToEnvironment(environment, actions.goBack),
      pushSheetContent: scopeToEnvironment(
        environment,
        actions.pushSheetContent
      ),
      setNavigationDisabled: scopeToEnvironment(
        environment,
        actions.setNavigationDisabled
      ),
      setSheetContent: scopeToEnvironment(environment, actions.setSheetContent),
    };
  }, [
    environment,
    actions.closeSheet,
    actions.goBack,
    actions.pushSheetContent,
    actions.setNavigationDisabled,
    actions.setSheetContent,
  ]);

  return {
    ...isolated,
    ...(derived as DerivedSheetContextState<T>),
    ...scoped,
  };
};

export default useSheet;
