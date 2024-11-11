import Image from 'next/image';
import NavbarAdmin from '../../components/NavbarAdmin';

export default function AdminPage() {
  return (
    <div className='flex flex-col min-h-screen'>
      <NavbarAdmin />
      <main className="flex-1 p-4 bg-slate-100 flex justify-center items-center">
        <div className='container rounded shadow-lg p-5 text-center flex flex-col md:flex-row'>
          <div className='md:w-1/2 flex justify-center items-center'>
          <Image src="/homeadmin.png" alt='' width={300} height={256} />
          </div>
          <div className='md:w-1/2 flex flex-col justify-center items-center text-center'>
            <h1 className='text-3xl font-bold'>Inspect the request and view the information</h1>
            <hr className='w-full my-4'/>
            <h4 className='text-xl'>Inspect information and view information</h4>
          </div>
        </div>
      </main>
    </div>
  );
}
