import { useState, useCallback } from "react";
import { User, UnionFetchState } from "../types/user";
import { parseUser } from "../parsers/user";

const API_URL = "https://jsonplaceholder.typicode.com/users";

/**
 * CORRECT PATTERN: Discriminated Union fetch state
 *
 * This hook demonstrates the proper approach using a discriminated union.
 *
 * BENEFITS:
 * 1. IMPOSSIBLE to have loading AND error simultaneously - the type won't allow it
 * 2. Each state carries only the data relevant to that state
 * 3. TypeScript FORCES exhaustive handling with switch statements
 * 4. No way to "forget" to update a flag - you set the entire state at once
 * 5. Self-documenting: the type tells you exactly what states are possible
 * 6. TYPED ERRORS: FetchError is a discriminated union — forgetting a variant is a compile error
 * 7. PARSE, DON'T VALIDATE: raw JSON is parsed at the boundary; domain types carry the proof
 */
export function useFetchUserUnion() {
  const [state, setState] = useState<UnionFetchState<User>>({ status: "idle" });

  const fetchUser = useCallback(async (userId: number) => {
    setState({ status: "loading" });

    try {
      // Simulate network delay for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Randomly fail 30% of the time to demonstrate error state
      if (Math.random() < 0.3) {
        setState({
          status: "error",
          error: { _tag: "NetworkError", message: "Random network failure (simulated for demo)" },
        });
        return;
      }

      const response = await fetch(`${API_URL}/${userId}`);

      if (!response.ok) {
        setState({
          status: "error",
          error: { _tag: "NotFound", userId },
        });
        return;
      }

      // Parse at the boundary: raw JSON → typed User (or a typed ParseError)
      // parseUser() is the ONLY place that uses type assertions
      const raw: unknown = await response.json();
      const result = parseUser(raw);

      if (!result.ok) {
        setState({ status: "error", error: result.error });
        return;
      }

      setState({ status: "success", data: result.value });
    } catch (err) {
      // Only truly unexpected throws reach here (e.g. network down)
      setState({
        status: "error",
        error: {
          _tag: "NetworkError",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    state,
    fetchUser,
    reset,
  };
}
