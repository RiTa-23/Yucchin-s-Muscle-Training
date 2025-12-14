import type { FormEvent, ChangeEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import bgImage from "@/assets/img/doubleyuttin.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Error and loading states
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "ログインに失敗しました");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.access_token);
      navigate("/home");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "ログインに失敗しました"
      );
      console.error("Login failed:", error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    setIsSignupLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "新規登録に失敗しました");
      }

      const data = await response.json();
      localStorage.setItem("authToken", data.access_token);
      navigate("/home");
    } catch (error) {
      setSignupError(
        error instanceof Error ? error.message : "新規登録に失敗しました"
      );
      console.error("Signup failed:", error);
    } finally {
      setIsSignupLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-yellow-200 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Tabs defaultValue="login" className="w-[400px] mt-[-90px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">ログイン</TabsTrigger>
          <TabsTrigger value="signup">新規登録</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>ログイン</CardTitle>
              <CardDescription>
                おかえり♡今​日も​ゆっちんと​頑張るわよぉん
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-2">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {loginError}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={loginEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLoginEmail(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLoginPassword(e.target.value)
                    }
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? "ログイン中..." : "ログイン"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>新規登録</CardTitle>
              <CardDescription>
                初めまして♡今​日から​あなたも​ムキムキよぉん
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-2">
                {signupError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {signupError}
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="username">ユーザーネーム</Label>
                  <Input
                    id="username"
                    value={signupUsername}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupUsername(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupEmail(e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupPassword(e.target.value)
                    }
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSignupLoading}
                >
                  {isSignupLoading ? "作成中..." : "アカウント作成"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <div className="mt-4 text-center text-sm">
          <Link to="/" className="text-black hover:underline text-base">
            スタート画面に戻る
          </Link>
        </div>
      </Tabs>
    </div>
  );
}
