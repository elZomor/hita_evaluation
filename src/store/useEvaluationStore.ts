import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SelectedAssignment, Answer, StartSessionResponse } from '../types';

interface AnswerMap {
  [key: string]: {
    // key = `${courseId}-${professorId}`
    [questionId: string]: Answer;
  };
}

interface EvaluationState {
  selectedDepartmentId: string | null;
  selectedRegulationId: number | null;
  isParallel: boolean | null;
  selectedAssignments: SelectedAssignment[];
  sessionData: StartSessionResponse | null;
  answers: AnswerMap;
  setSelectedDepartment: (departmentId: string | null) => void;
  setSelectedRegulation: (regulationId: number | null) => void;
  setIsParallel: (isParallel: boolean | null) => void;
  toggleAssignment: (assignment: SelectedAssignment) => void;
  clearAssignments: () => void;
  setSessionData: (data: StartSessionResponse) => void;
  setAnswer: (
    courseId: number,
    professorId: number,
    questionId: number,
    answer: Answer
  ) => void;
  getAnswersForProfessor: (courseId: number, professorId: number) => Answer[];
  resetAll: () => void;
}

const STORAGE_KEY = 'kiosk-evaluation-state';

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set, get) => ({
      selectedDepartmentId: null,
      selectedRegulationId: null,
      isParallel: null,
      selectedAssignments: [],
      sessionData: null,
      answers: {},

      setSelectedDepartment: (departmentId) =>
        set({
          selectedDepartmentId: departmentId,
          selectedAssignments: [],
          isParallel: null,
          selectedRegulationId: null,
        }),

      setSelectedRegulation: (regulationId) =>
        set({ selectedRegulationId: regulationId, selectedAssignments: [] }),

      setIsParallel: (isParallel) =>
        set({ isParallel, selectedAssignments: [] }),

      toggleAssignment: (assignment) =>
        set((state) => {
          const exists = state.selectedAssignments.some(
            (a) => a.assignmentId === assignment.assignmentId
          );
          if (exists) {
            return {
              selectedAssignments: state.selectedAssignments.filter(
                (a) => a.assignmentId !== assignment.assignmentId
              ),
            };
          } else {
            return {
              selectedAssignments: [...state.selectedAssignments, assignment],
            };
          }
        }),

      clearAssignments: () =>
        set({ selectedAssignments: [], selectedDepartmentId: null }),

      setSessionData: (data) => set({ sessionData: data }),

      setAnswer: (courseId, professorId, questionId, answer) =>
        set((state) => {
          const key = `${courseId}-${professorId}`;
          return {
            answers: {
              ...state.answers,
              [key]: {
                ...state.answers[key],
                [questionId]: answer,
              },
            },
          };
        }),

      getAnswersForProfessor: (courseId, professorId) => {
        const state = get();
        const key = `${courseId}-${professorId}`;
        const professorAnswers = state.answers[key];
        if (!professorAnswers) return [];
        return Object.values(professorAnswers);
      },

      resetAll: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({
          selectedDepartmentId: null,
          selectedRegulationId: null,
          isParallel: null,
          selectedAssignments: [],
          sessionData: null,
          answers: {},
        });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
