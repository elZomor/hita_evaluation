import type { Department, CatalogResponse, QuestionsResponse } from '../../types';

export const mockDepartments: Department[] = [
  { id: 'dept-1', name_ar: 'قسم علوم الحاسوب', name_en: 'Computer Science Department' },
  { id: 'dept-2', name_ar: 'قسم الهندسة الكهربائية', name_en: 'Electrical Engineering Department' },
  { id: 'dept-3', name_ar: 'قسم الرياضيات', name_en: 'Mathematics Department' },
];

const createCatalogForDepartment = (deptId: string, deptNamePrefix: string): CatalogResponse => {
  const baseId = deptId.replace('dept-', '');
  return {
    categories: [
      {
        id: `cat-${baseId}-1`,
        type: 'REQUIRED',
        scope: 'ACADEMY',
        title_ar: 'مقررات إجبارية - الأكاديمية',
        title_en: 'Required - Academy',
        items: [
          {
            assignmentId: `assign-${baseId}-1`,
            courseId: `course-${baseId}-1`,
            courseName_ar: `مقرر أكاديمي إجباري 1 - ${deptNamePrefix}`,
            courseName_en: `Required Academy Course 1 - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-1`,
            professorName_ar: 'د. عبدالله محمد',
            professorName_en: 'Dr. Abdullah Mohamed',
          },
          {
            assignmentId: `assign-${baseId}-2`,
            courseId: `course-${baseId}-2`,
            courseName_ar: `مقرر أكاديمي إجباري 2 - ${deptNamePrefix}`,
            courseName_en: `Required Academy Course 2 - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-2`,
            professorName_ar: 'د. سلمى أحمد',
            professorName_en: 'Dr. Salma Ahmed',
          },
        ],
      },
      {
        id: `cat-${baseId}-2`,
        type: 'REQUIRED',
        scope: 'INSTITUTE',
        title_ar: 'مقررات إجبارية - المعهد',
        title_en: 'Required - Institute',
        items: [
          {
            assignmentId: `assign-${baseId}-3`,
            courseId: `course-${baseId}-3`,
            courseName_ar: `مقرر معهد إجباري 1 - ${deptNamePrefix}`,
            courseName_en: `Required Institute Course 1 - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-3`,
            professorName_ar: 'د. حسن علي',
            professorName_en: 'Dr. Hassan Ali',
          },
        ],
      },
      {
        id: `cat-${baseId}-3`,
        type: 'REQUIRED',
        scope: 'DEPARTMENT',
        title_ar: 'مقررات إجبارية - القسم',
        title_en: 'Required - Department',
        items: [
          {
            assignmentId: `assign-${baseId}-4`,
            courseId: `course-${baseId}-4`,
            courseName_ar: `مقرر قسم إجباري 1 - ${deptNamePrefix}`,
            courseName_en: `Required Department Course 1 - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-4`,
            professorName_ar: 'د. منى سعيد',
            professorName_en: 'Dr. Mona Said',
          },
          {
            assignmentId: `assign-${baseId}-5`,
            courseId: `course-${baseId}-5`,
            courseName_ar: `مقرر قسم إجباري 2 - ${deptNamePrefix}`,
            courseName_en: `Required Department Course 2 - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-5`,
            professorName_ar: 'د. كريم عبدالرحمن',
            professorName_en: 'Dr. Kareem Abdelrahman',
          },
        ],
      },
      {
        id: `cat-${baseId}-4`,
        type: 'OPTIONAL',
        scope: 'ACADEMY',
        title_ar: 'مقررات اختيارية - الأكاديمية',
        title_en: 'Optional - Academy',
        items: [
          {
            assignmentId: `assign-${baseId}-6`,
            courseId: `course-${baseId}-6`,
            courseName_ar: `مقرر أكاديمي اختياري - ${deptNamePrefix}`,
            courseName_en: `Optional Academy Course - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-6`,
            professorName_ar: 'د. رنا خالد',
            professorName_en: 'Dr. Rana Khaled',
          },
        ],
      },
      {
        id: `cat-${baseId}-5`,
        type: 'OPTIONAL',
        scope: 'INSTITUTE',
        title_ar: 'مقررات اختيارية - المعهد',
        title_en: 'Optional - Institute',
        items: [
          {
            assignmentId: `assign-${baseId}-7`,
            courseId: `course-${baseId}-7`,
            courseName_ar: `مقرر معهد اختياري - ${deptNamePrefix}`,
            courseName_en: `Optional Institute Course - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-7`,
            professorName_ar: 'د. عمار حسين',
            professorName_en: 'Dr. Ammar Hussein',
          },
        ],
      },
      {
        id: `cat-${baseId}-6`,
        type: 'OPTIONAL',
        scope: 'DEPARTMENT',
        title_ar: 'مقررات اختيارية - القسم',
        title_en: 'Optional - Department',
        items: [
          {
            assignmentId: `assign-${baseId}-8`,
            courseId: `course-${baseId}-8`,
            courseName_ar: `مقرر قسم اختياري - ${deptNamePrefix}`,
            courseName_en: `Optional Department Course - ${deptNamePrefix}`,
            professorId: `prof-${baseId}-8`,
            professorName_ar: 'د. نادية فهمي',
            professorName_en: 'Dr. Nadia Fahmy',
          },
        ],
      },
    ],
  };
};

export const mockCatalogData: Record<string, CatalogResponse> = {
  'dept-1': {
    categories: [
      {
        id: 'cat-1',
        type: 'REQUIRED',
        scope: 'ACADEMY',
        title_ar: 'مقررات إجبارية - الأكاديمية',
        title_en: 'Required - Academy',
        items: [
          {
            assignmentId: 'assign-1',
            courseId: 'course-1',
            courseName_ar: 'مقدمة في البرمجة',
            courseName_en: 'Introduction to Programming',
            professorId: 'prof-1',
            professorName_ar: 'د. أحمد محمد',
            professorName_en: 'Dr. Ahmed Mohamed',
          },
          {
            assignmentId: 'assign-2',
            courseId: 'course-2',
            courseName_ar: 'الرياضيات المتقدمة',
            courseName_en: 'Advanced Mathematics',
            professorId: 'prof-2',
            professorName_ar: 'د. فاطمة علي',
            professorName_en: 'Dr. Fatima Ali',
          },
        ],
      },
      {
        id: 'cat-2',
        type: 'REQUIRED',
        scope: 'INSTITUTE',
        title_ar: 'مقررات إجبارية - المعهد',
        title_en: 'Required - Institute',
        items: [
          {
            assignmentId: 'assign-3',
            courseId: 'course-3',
            courseName_ar: 'هندسة البرمجيات',
            courseName_en: 'Software Engineering',
            professorId: 'prof-3',
            professorName_ar: 'د. محمد حسن',
            professorName_en: 'Dr. Mohamed Hassan',
          },
          {
            assignmentId: 'assign-4',
            courseId: 'course-4',
            courseName_ar: 'نظم التشغيل',
            courseName_en: 'Operating Systems',
            professorId: 'prof-4',
            professorName_ar: 'د. سارة يوسف',
            professorName_en: 'Dr. Sara Youssef',
          },
        ],
      },
      {
        id: 'cat-3',
        type: 'REQUIRED',
        scope: 'DEPARTMENT',
        title_ar: 'مقررات إجبارية - القسم',
        title_en: 'Required - Department',
        items: [
          {
            assignmentId: 'assign-5',
            courseId: 'course-5',
            courseName_ar: 'قواعد البيانات',
            courseName_en: 'Database Systems',
            professorId: 'prof-5',
            professorName_ar: 'د. خالد إبراهيم',
            professorName_en: 'Dr. Khaled Ibrahim',
          },
          {
            assignmentId: 'assign-6',
            courseId: 'course-6',
            courseName_ar: 'الذكاء الاصطناعي',
            courseName_en: 'Artificial Intelligence',
            professorId: 'prof-6',
            professorName_ar: 'د. نور الدين',
            professorName_en: 'Dr. Nour Aldin',
          },
          {
            assignmentId: 'assign-7',
            courseId: 'course-7',
            courseName_ar: 'الشبكات الحاسوبية',
            courseName_en: 'Computer Networks',
            professorId: 'prof-7',
            professorName_ar: 'د. ليلى محمود',
            professorName_en: 'Dr. Layla Mahmoud',
          },
        ],
      },
      {
        id: 'cat-4',
        type: 'OPTIONAL',
        scope: 'ACADEMY',
        title_ar: 'مقررات اختيارية - الأكاديمية',
        title_en: 'Optional - Academy',
        items: [
          {
            assignmentId: 'assign-8',
            courseId: 'course-8',
            courseName_ar: 'الفلسفة والمنطق',
            courseName_en: 'Philosophy and Logic',
            professorId: 'prof-8',
            professorName_ar: 'د. عمر سعيد',
            professorName_en: 'Dr. Omar Said',
          },
        ],
      },
      {
        id: 'cat-5',
        type: 'OPTIONAL',
        scope: 'INSTITUTE',
        title_ar: 'مقررات اختيارية - المعهد',
        title_en: 'Optional - Institute',
        items: [
          {
            assignmentId: 'assign-9',
            courseId: 'course-9',
            courseName_ar: 'تطوير تطبيقات الويب',
            courseName_en: 'Web Application Development',
            professorId: 'prof-9',
            professorName_ar: 'د. مريم أحمد',
            professorName_en: 'Dr. Mariam Ahmed',
          },
          {
            assignmentId: 'assign-10',
            courseId: 'course-10',
            courseName_ar: 'الحوسبة السحابية',
            courseName_en: 'Cloud Computing',
            professorId: 'prof-10',
            professorName_ar: 'د. يوسف كمال',
            professorName_en: 'Dr. Youssef Kamal',
          },
        ],
      },
      {
        id: 'cat-6',
        type: 'OPTIONAL',
        scope: 'DEPARTMENT',
        title_ar: 'مقررات اختيارية - القسم',
        title_en: 'Optional - Department',
        items: [
          {
            assignmentId: 'assign-11',
            courseId: 'course-11',
            courseName_ar: 'التعلم الآلي',
            courseName_en: 'Machine Learning',
            professorId: 'prof-11',
            professorName_ar: 'د. هدى عبدالله',
            professorName_en: 'Dr. Huda Abdullah',
          },
          {
            assignmentId: 'assign-12',
            courseId: 'course-12',
            courseName_ar: 'أمن المعلومات',
            courseName_en: 'Information Security',
            professorId: 'prof-12',
            professorName_ar: 'د. طارق زكي',
            professorName_en: 'Dr. Tarek Zaki',
          },
        ],
      },
    ],
  },
  'dept-2': createCatalogForDepartment('dept-2', 'EE'),
  'dept-3': createCatalogForDepartment('dept-3', 'Math'),
};

const commonQuestions: QuestionsResponse = {
  assignmentId: '',
  questions: [
    {
      id: 'q-1',
      type: 'RATING',
      required: true,
      text_ar: 'ما مدى وضوح شرح الأستاذ للمادة؟',
      text_en: 'How clear was the professor\'s explanation of the material?',
      order: 1,
    },
    {
      id: 'q-2',
      type: 'RATING',
      required: true,
      text_ar: 'ما مدى تفاعل الأستاذ مع الطلاب؟',
      text_en: 'How engaged was the professor with students?',
      order: 2,
    },
    {
      id: 'q-3',
      type: 'RATING',
      required: true,
      text_ar: 'ما تقييمك لتنظيم المحاضرات؟',
      text_en: 'How would you rate the organization of lectures?',
      order: 3,
    },
    {
      id: 'q-4',
      type: 'RATING',
      required: true,
      text_ar: 'ما مدى استفادتك من المقرر؟',
      text_en: 'How much did you benefit from this course?',
      order: 4,
    },
    {
      id: 'q-5',
      type: 'TEXT',
      required: false,
      text_ar: 'ما هي نقاط القوة في أداء الأستاذ؟',
      text_en: 'What are the strengths of the professor\'s performance?',
      order: 5,
    },
    {
      id: 'q-6',
      type: 'TEXT',
      required: false,
      text_ar: 'ما هي المجالات التي يمكن تحسينها؟',
      text_en: 'What areas could be improved?',
      order: 6,
    },
  ],
};

export const getQuestionsForAssignment = (assignmentId: string): QuestionsResponse => {
  return {
    ...commonQuestions,
    assignmentId,
  };
};
