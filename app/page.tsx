import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the numbers page
  redirect('/numbers');
}
