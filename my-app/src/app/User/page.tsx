import Image from 'next/image';
import NavbarUser from '../../components/NavbarUser';

export default function UserPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarUser />
      <main className="flex-1 p-4 bg-slate-100 flex justify-center items-center">
        <div className="container rounded shadow-lg p-5 text-center flex flex-col md:flex-row">
          <div className="md:w-1/2 flex justify-center items-center">
            <Image src="/inform.png" alt='' width={300} height={256} />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center items-center text-center">
            <h1 className='text-3xl font-bold'>Repair Request or New Request System.</h1>
            <hr className="w-full my-4" />
            <h4 className='text-xl'>Select the type of request you will be performing</h4>
          </div>
        </div>
      </main>
    </div>

  );
}
