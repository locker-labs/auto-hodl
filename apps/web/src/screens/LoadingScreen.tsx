import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className={'w-full h-full flex items-center justify-center'}>
      <div className={'flex flex-col gap-2 items-center py-24'}>
        <Loader2 className={'animate-spin size-12'} color={'#ff7a45'} />
        <p>Loading</p>
      </div>
    </div>
  );
}
