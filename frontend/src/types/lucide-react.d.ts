declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export const Pencil: FC<LucideProps>;
  export const Trash2: FC<LucideProps>;
  export const Plus: FC<LucideProps>;
  export const X: FC<LucideProps>;
  export const Check: FC<LucideProps>;
  export const AlertCircle: FC<LucideProps>;
}
