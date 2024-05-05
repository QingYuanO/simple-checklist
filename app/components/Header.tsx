import { useNavigate } from '@remix-run/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface HeaderProps {
  title: string;
  isBack?: boolean;
  rightContent?: React.ReactNode;
}

export default function Header({ title, isBack, rightContent }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <div className='fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-center border-b border-border bg-white text-base shadow-sm sm:mx-auto sm:max-w-2xl print:shadow-none'>
      {isBack && (
        <ArrowLeft className='absolute left-4 top-1/2 size-5 -translate-y-1/2 cursor-pointer print:hidden' onClick={() => navigate(-1)} />
      )}
      <span className='text-lg font-semibold'>{title}</span>
      {rightContent && <div className='absolute right-4 top-1/2 -translate-y-1/2'>{rightContent}</div>}
    </div>
  );
}
