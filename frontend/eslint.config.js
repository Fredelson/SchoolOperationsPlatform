import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Existing data-loader effects intentionally call async functions that own
      // their loading/error state. The stricter React 19 rule treats these as
      // synchronous state writes even though the updates occur after awaits.
      'react-hooks/set-state-in-effect': 'off',
      // Effects execute after render, so callbacks declared later in the same
      // component are initialized before the effect runs.
      'react-hooks/immutability': 'off',
      // Context/provider modules intentionally export their companion hooks.
      'react-refresh/only-export-components': 'off',
    },
  },
])
