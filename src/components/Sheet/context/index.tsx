"use client";

import React, {
  createContext,
  FC,
  PropsWithChildren,
  ReactElement,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function noop(): void {}

/**
 * This context provider manages the state of our sheets. Every state and action is bound to an environment which provides an isolated state
 * This allows us to have multiple sheets open at the same time, each with their own state and to seperate the
 * state of sheets in different layouts (e.g. LinkerLayout vs ViewerLayout) while sharing the complex sheet logic
 */

export type SheetContent<T = unknown> =
  | {
      id: string;
      // the content for the sheet
      component: ReactElement;
      // title for the sheet
      title?: string;
      // if true, don't darken the backdrop behind the sheet
      transparentBackdrop?: boolean;
      // if true autosize the sheet to the content
      fitToContent?: boolean;
      // theme
      theme?: "light" | "dark";
      // any optional, additional content you want to pass to the sheet
      details?: T;
      // callback when navigating to the previous sheet in the current stack
      onBack?: () => void;
    }
  | undefined;

export type SheetContextState<T = unknown> = {
  open: boolean;
  // contains the content stack of the sheet
  stack: SheetContent<T>[];
  // when true, navigation between sheets in the stack is disabled
  navigationDisabled: boolean;
};

export type SheetActions<T = unknown> = {
  closeSheet: (environment: string) => void;
  goBack: (environment: string) => void;
  // adds content to the sheet stack
  pushSheetContent: (environment: string, content: SheetContent<T>) => void;
  // sets the content from scratch (replaces the entire stack)
  setSheetContent: (environment: string, content: SheetContent<T>) => void;
  setNavigationDisabled: (environment: string, disabled: boolean) => void;
};

export type ContextType = {
  state: Record<string, SheetContextState>;
  actions: SheetActions;
};

export const SheetContext = createContext<ContextType>({
  state: {},
  actions: {
    closeSheet: noop,
    goBack: noop,
    // adds content to the sheet stack
    pushSheetContent: noop,
    // sets the content from scratch (replaces the entire stack)
    setSheetContent: noop,
    setNavigationDisabled: noop,
  },
});

export const DEFAULT_SHEET_STATE: SheetContextState = {
  navigationDisabled: false,
  open: false,
  stack: [],
};

const SheetContextProvider: FC<PropsWithChildren> = ({ children }) => {
  // maps a key to a sheet context state (we can have different sheets e.g Linker Sheet vs Viewer Sheet with different stacks)
  const [state, setState] = useState<Record<string, SheetContextState>>({});
  const anySheetOpen = Object.values(state).some((x) => x.open);

  const closeWipeTimeoutRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | undefined>
  >({});

  const clearWipeTimeout = useCallback((environment: string) => {
    if (closeWipeTimeoutRef.current[environment]) {
      // we were in the process of closing the sheet when we added content, so clear it first
      clearTimeout(closeWipeTimeoutRef.current[environment]);

      closeWipeTimeoutRef.current[environment] = undefined;
    }
  }, []);

  const setEnvironmentState = useCallback(
    (
      environment: string,
      mutation: SetStateAction<SheetContextState>
    ): void => {
      setState((x) => {
        return {
          ...x,
          [environment]:
            typeof mutation === "function"
              ? mutation(x[environment] ?? DEFAULT_SHEET_STATE)
              : mutation,
        };
      });
    },
    []
  );

  const closeSheet = useCallback(
    (environment: string): void => {
      setEnvironmentState(environment, (x) => ({
        ...x,
        open: false,
        navigationDisabled: false,
        stack:
          x.stack.length > 0
            ? [
                {
                  ...x.stack[x.stack.length - 1],
                  id: "__CLOSING__",
                } as SheetContent,
              ]
            : [],
      }));

      closeWipeTimeoutRef.current[environment] = setTimeout(() => {
        setEnvironmentState(environment, (x) => ({
          ...x,
          stack: [],
        }));
      }, 600);
    },
    [setEnvironmentState]
  );

  const closeAllSheets = useCallback((): void => {
    Object.keys(state).forEach(closeSheet);
  }, [closeSheet, state]);

  const goBack = useCallback(
    (environment: string): void => {
      setEnvironmentState(environment, (x) => {
        if (x.navigationDisabled) return x;
        if (x.stack.length === 0) return x;
        if (x.stack.length === 1)
          throw new Error("Cannot go back from the first sheet");

        const current = x.stack[x.stack.length - 1];

        // trigger the callback if needed
        current?.onBack?.();

        return {
          ...x,
          navigationDisabled: false,
          stack: x.stack.slice(0, -1),
        };
      });
    },
    [setEnvironmentState]
  );

  const setNavigationDisabled = useCallback(
    (environment: string, disabled: boolean): void => {
      setEnvironmentState(environment, (x) => ({
        ...x,
        navigationDisabled: disabled,
      }));
    },
    [setEnvironmentState]
  );

  const pushSheetContent = useCallback(
    (environment: string, content: SheetContent): void => {
      setEnvironmentState(environment, (x) => {
        let stack = x.stack;

        if (closeWipeTimeoutRef.current[environment]) {
          clearWipeTimeout(environment);

          stack = [];
        }

        return {
          ...x,
          open: true,
          stack: [...stack, content],
        };
      });
    },
    [setEnvironmentState, clearWipeTimeout]
  );

  const setSheetContent = useCallback(
    (environment: string, content: SheetContent): void => {
      clearWipeTimeout(environment);

      setEnvironmentState(environment, (x) => {
        return {
          ...x,
          open: true,
          stack: [content],
        };
      });
    },
    [setEnvironmentState, clearWipeTimeout]
  );

  // Scroll lock the body when the sheet is open
  useEffect(() => {
    console.log("Any Sheet Open", anySheetOpen);
    if (anySheetOpen) {
      document.body.classList.add("overflow-hidden-mobile");
    } else if (document.body.classList.contains("overflow-hidden-mobile")) {
      document.body.classList.remove("overflow-hidden-mobile");
    }
  }, [anySheetOpen]);

  const value: ContextType = useMemo(
    () => ({
      state: state,
      actions: {
        closeSheet,
        goBack,
        setNavigationDisabled,
        pushSheetContent,
        setSheetContent,
      },
    }),
    [
      state,
      pushSheetContent,
      setSheetContent,
      closeSheet,
      goBack,
      setNavigationDisabled,
    ]
  );

  return (
    <SheetContext.Provider value={value}>{children}</SheetContext.Provider>
  );
};

export default SheetContextProvider;
