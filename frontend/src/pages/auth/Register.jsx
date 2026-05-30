import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/axios";

import AuthLayout from "../../layouts/AuthLayout";
import AuthCard from "../../components/common/AuthCard";
import AuthInput from "../../components/common/AuthInput";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    studioName: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      alert("Studio Created Successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthLayout>
      <AuthCard title="Create Studio">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            placeholder="Username"
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
          />

          <AuthInput
            placeholder="Email"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <AuthInput
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <AuthInput
            placeholder="Studio Name"
            onChange={(e) =>
              setForm({
                ...form,
                studioName: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="
            w-full
            bg-violet-600
            hover:bg-violet-700
            py-3
            rounded-xl
            font-semibold
            transition
            "
          >
            Create Studio
          </button>

          <p className="text-center text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400">
              Login
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
