/**
 * Custom entry point.
 *
 * This file runs BEFORE any app code (including lib/supabase.ts, lib/DeviceContext.tsx,
 * and every screen) is imported. Its only job is to install a global JS error handler
 * so that if anything throws during startup — even a synchronous error thrown while a
 * module is being imported — the app shows a readable on-screen message instead of
 * silently crashing with a native "keeps stopping" dialog.
 *
 * React Native's module loader wraps every `require()` call in the currently-registered
 * global error handler, so installing it here, first, lets us catch errors that happen
 * even before the React tree exists (where a React ErrorBoundary cannot help).
 */
import { Alert } from 'react-native';

try {
  const ErrorUtilsGlobal = global.ErrorUtils;

  if (ErrorUtilsGlobal && typeof ErrorUtilsGlobal.setGlobalHandler === 'function') {
    ErrorUtilsGlobal.setGlobalHandler((error, isFatal) => {
      const message = (error && error.message) || String(error);
      const stack = (error && error.stack) || '';

      // Always log it, in case a logcat/log viewer is available.
      // eslint-disable-next-line no-console
      console.error('[AppStartupError]', isFatal ? 'FATAL' : 'non-fatal', message, stack);

      try {
        Alert.alert(
          isFatal ? 'برنامه با خطا مواجه شد' : 'خطا',
          `${message}\n\n${stack}`.slice(0, 1800),
          [{ text: 'باشه' }],
          { cancelable: true }
        );
      } catch (alertError) {
        // If even Alert fails, there's nothing more we can safely do here.
      }

      // Intentionally NOT re-throwing / forwarding to the default handler:
      // the default handler for fatal errors terminates the app process,
      // which is exactly the "keeps stopping" crash we're trying to avoid.
      // Showing the message and staying alive (even if the UI is broken)
      // is far more useful for diagnosing the problem.
    });
  }
} catch (setupError) {
  // If installing the handler itself fails, fall through silently —
  // worst case we're back to default behavior.
}

require('expo-router/entry');
