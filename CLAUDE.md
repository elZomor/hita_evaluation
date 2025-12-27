# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev        # Start Vite development server
npm run build      # Build production bundle
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking (tsc --noEmit)
npm run preview    # Preview production build
```

## Project Overview

A bilingual (Arabic/English) professor/course evaluation kiosk application built with React, TypeScript, and Vite.

## Architecture

**3-Page Workflow:**
- `StartPage` → `SelectPage` → `EvaluatePage`
- Users start, select courses/departments, then complete evaluations

**Key Directories:**
- `src/components/` - Reusable UI components (Header, RatingButtons, etc.)
- `src/pages/` - Page-level components for each workflow step
- `src/store/` - Zustand state management with localStorage persistence
- `src/lib/api/` - API client with mock data (Supabase-ready)
- `src/lib/i18n/` - i18next configuration for Arabic/English
- `src/lib/contexts/` - Theme context for dark/light mode
- `src/types/` - TypeScript type definitions

**State Management:**
- Zustand store (`useEvaluationStore.ts`) with persistence middleware
- Stores selected courses, evaluation responses, and session state

**Styling:**
- Tailwind CSS with class-based dark mode (`dark:` prefix)
- RTL support for Arabic (default), LTR for English

**Inactivity Handling:**
- 45-second timeout hook (`useInactivityTimer.ts`) resets session on inactivity

**API Layer:**
- Currently uses mock data in `mockData.ts`
- Supabase client configured and ready for real backend integration
