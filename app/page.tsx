import Link from 'next/link'
export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <p className='mb-2'>Welcome to my chat app</p>
      <Link href= "/signup" prefetch={true} className='p-2.5 bg-gray-800 rounded-2xl'>Click to get started</Link>
    </div>
  );
}
