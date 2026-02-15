import Link from "next/link";
import SingUpForm from "./SignUpForm";
export default function SingUp() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Register with Email</h1>
      <SingUpForm/>
      <Link href="/login">Already have an account?</Link>
    </div>
  );
}
