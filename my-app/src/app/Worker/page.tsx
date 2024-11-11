import Image from 'next/image';
import NavbarWorker from '../../components/NavbarWorker';

export default function WorkerPage() {
  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarWorker />
      <main className="flex-1 p-4 bg-slate-50 flex justify-center items-center">
        <div className='container rounded shadow-lg p-5 text-center flex flex-col md:flex-row'>
          <div className='md:w-1/2 flex justify-center items-center'>
            <Image src="/wroker.png" alt='' width={350} height={356}/>
          </div>
          <div className='md:w-1/2 flex flex-col justify-center items-center text-center'>
            <h1 className='text-3xl font-bold'>Repair Technician System.</h1>
            <hr className='w-full my-4'/>
            <h4 className='text-xl'>Select the type of repair you will be performing</h4>
          </div>
        </div>
      </main>
    </div>
  );
}
