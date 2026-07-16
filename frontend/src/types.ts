export type Role = "PLATFORM_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";

export type ContentType = "PDF" | "VIDEO";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  schoolId: string | null;
  gradeId: string | null;
  classId: string | null;
  schoolName?: string | null;
  activationCode?: string | null;
};

export type Grade = {
  id: string;
  name: string;
  level: number;
  classes?: ClassSection[];
};

export type ClassSection = {
  id: string;
  name: string;
  gradeId: string;
};

export type Subject = { id: string; name: string; gradeId: string; schoolId: string };
export type Chapter = { id: string; name: string; subjectId: string };
export type Topic = { id: string; name: string; chapterId: string };

export type ContentItem = {
  id: string;
  title: string;
  description: string | null;
  type: ContentType;
  topicId: string;
  schoolId: string;
  uploadedById: string;
  createdAt: string;
  /** Public URL (e.g. YouTube) when content is not a local upload. */
  externalUrl?: string | null;
};

export type SchoolRow = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  activationCode: string | null;
  schoolAdmin: { id: string; email: string; name: string | null } | null;
  stats: {
    teacherCount: number;
    studentCount: number;
    schoolAdminCount: number;
    loginCount: number;
    distinctLoginUsers: number;
  };
};

export type RootStackParamList = {
  Login: undefined;
  Schools: undefined;
  SchoolDetail: { schoolId: string; schoolName: string };
  ManageUsers: undefined;
  GradeSelect: undefined;
  Subjects: { gradeId: string; gradeName: string };
  Chapters: { subjectId: string; subjectName: string; gradeId: string };
  Topics: { chapterId: string; chapterName: string; gradeId: string };
  TopicContent: { topicId: string; topicName: string; gradeId: string };
  ContentViewer: {
    contentId: string;
    title: string;
    type: ContentType;
    externalUrl?: string | null;
  };
};
