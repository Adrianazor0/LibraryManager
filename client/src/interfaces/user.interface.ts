export interface User {
  id: string;
  name: string;
  role: 'admin' | 'estudiante' | 'docente' | 'bibliotecario';
  enrollmentId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export interface ILibraryPolicy {
  _id: string;
  section: string;
  canBorrow: boolean;
  rules: {
    role: string;
    maxBooks: number;
    loanDays: number;
  }[];
}