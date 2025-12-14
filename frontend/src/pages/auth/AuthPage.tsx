import { useState, type FormEvent, type ChangeEvent } from "react";
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
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, signup } = useAuth();

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

    // Helper to parse backend errors
    const parseError = (error: any) => {
        if (error.response && error.response.data && error.response.data.detail) {
            const details = error.response.data.detail;
            if (Array.isArray(details)) {
                return details.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join("\n");
            } else {
                return details;
            }
        }
        return error instanceof Error ? error.message : "エラーが発生しました";
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginError("");
        setIsLoginLoading(true);

        try {
            await login(loginEmail, loginPassword);
            navigate("/home");
        } catch (error) {
            console.error("Login failed:", error);
            // For login, usually a simple message is better, but we can use parseError if we want specific details
            // But typically auth endpoints return 401 with generic message
            setLoginError("ログインに失敗しました。ユーザー名またはパスワードを確認してください。");
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSignupError("");
        setIsSignupLoading(true);

        try {
            await signup(signupUsername, signupEmail, signupPassword);
            navigate("/home");
        } catch (error: any) {
            console.error("Signup failed:", error);
            const errorMessage = parseError(error);
            setSignupError(errorMessage);
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
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm whitespace-pre-wrap">
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
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm whitespace-pre-wrap">
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
