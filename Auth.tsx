import { useState } from "react";
import { signIn, signUp } from "./lib/auth";

type AuthProps = {
  onLogin: () => void;
};

function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        // LOGIN
        const { error } = await signIn(email, password);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Login successful!");

        onLogin();
      } else {
        // SIGN UP
        const { data, error } = await signUp(
          email,
          password
        );

        if (error) {
          alert(error.message);
          return;
        }

        if (data.user) {
          alert(
            "Account created successfully! You can now login."
          );

          setIsLogin(true);
        }
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f7f3ed",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "15px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Artisan Marketplace
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          {isLogin
            ? "Welcome back!"
            : "Create your account"}
        </p>

        {/* EMAIL */}

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {/* PASSWORD */}

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "8px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {/* SUBMIT */}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Please wait..."
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>

        {/* SWITCH LOGIN/SIGNUP */}

        <p
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() =>
              setIsLogin(!isLogin)
            }
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              marginLeft: "5px",
              textDecoration: "underline",
            }}
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;