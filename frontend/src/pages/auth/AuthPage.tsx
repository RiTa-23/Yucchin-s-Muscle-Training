import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, signup } = useAuth();

    // Login State
    const [loginEmail, setLoginEmail] = useState(""); // This is actually username in backend?
    // Backend expects 'username' for OAuth2PasswordRequestForm.
    // However, the AuthPage UI says "Email" for login label (line 54).
    // But backend logic (auth.py) uses `username=form_data.username`.
    // If user inputs email as username, that's fine if we registered with email as username?
    // Wait, typical OAuth2 uses 'username' field, which can hold email.
    // Let's assume input id="email" is for username/email.
    const [loginPassword, setLoginPassword] = useState("");

    // Signup State
    const [signupUsername, setSignupUsername] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await login(loginEmail, loginPassword);
            navigate("/home");
        } catch (error) {
            console.error(error);
            alert("ログインに失敗しました。ユーザー名またはパスワードを確認してください。");
        }
    };

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await signup(signupUsername, signupEmail, signupPassword);
            navigate("/home");
        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.detail) {
                // Pydantic validation error
                const details = error.response.data.detail;
                if (Array.isArray(details)) {
                    const messages = details.map((d: any) => `${d.loc.join(".")}: ${d.msg}`).join("\n");
                    alert(`登録エラー:\n${messages}`);
                } else {
                    alert(`登録エラー: ${details}`);
                }
            } else {
                alert("登録に失敗しました。サーバーを確認してください。");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <Tabs defaultValue="login" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">ログイン</TabsTrigger>
                    <TabsTrigger value="signup">新規登録</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>ログイン</CardTitle>
                            <CardDescription>
                                アカウント情報を入力してください。
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="login-username">ユーザー名</Label>
                                    <Input
                                        id="login-username"
                                        placeholder="ユーザー名を入力"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">パスワード</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">ログイン</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <TabsContent value="signup">
                    <Card>
                        <CardHeader>
                            <CardTitle>新規登録</CardTitle>
                            <CardDescription>
                                アカウントを作成してトレーニングを始めましょう。
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSignup}>
                            <CardContent className="space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="username">ユーザーネーム</Label>
                                    <Input
                                        id="username"
                                        required
                                        value={signupUsername}
                                        onChange={(e) => setSignupUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="signup-email">メールアドレス</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        required
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="signup-password">パスワード</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        required
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full">アカウント作成</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
                <div className="mt-4 text-center text-sm">
                    <Link to="/" className="text-muted-foreground hover:underline">スタート画面に戻る</Link>
                </div>
            </Tabs>
        </div>
    );
}
