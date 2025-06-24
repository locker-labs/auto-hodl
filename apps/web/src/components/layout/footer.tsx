import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='mt-auto p-4 text-center text-sm text-[#6B6B6B]'>
      <p>
        <span>Made by </span>
        <span className={'underline hover:underline-offset-2 transition-all duration-300'}>
          <Link href='https://locker.money' target='_blank' rel='noopener noreferrer'>
            Locker
          </Link>
        </span>
      </p>
      {/*<p>*/}
      {/*  <span className={'hover:underline transition-all duration-300'}>*/}
      {/*    <Link href='https://t.me/+stsNEbe16tU5MTY5' target='_blank' rel='noopener noreferrer'>*/}
      {/*      Telegram*/}
      {/*    </Link>*/}
      {/*  </span>*/}
      {/*  <span> | </span>*/}
      {/*  <span className={'hover:underline transition-all duration-300'}>*/}
      {/*    <Link href='https://github.com/locker-labs' target='_blank' rel='noopener noreferrer'>*/}
      {/*      GitHub*/}
      {/*    </Link>*/}
      {/*  </span>*/}
      {/*</p>*/}
    </footer>
  );
}
