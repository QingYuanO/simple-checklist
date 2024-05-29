import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export default function CheckListStatusTabs({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Tabs defaultValue='ALL' className=' w-full px-4 pt-4' onValueChange={onValueChange}>
      <TabsList className='w-full justify-between'>
        <TabsTrigger value='ALL'>全部</TabsTrigger>
        <TabsTrigger value='WAIT'>待处理</TabsTrigger>
        <TabsTrigger value='PROGRESS'>处理中</TabsTrigger>
        <TabsTrigger value='DONE'>已完成</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
