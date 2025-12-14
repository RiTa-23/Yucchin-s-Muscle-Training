import type { FormEvent } from "react";
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

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    navigate("/home");
  };

  const handleSignup = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implement actual signup logic
    navigate("/home");
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
                <div className="space-y-1">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">パスワード</Label>
                  <Input id="password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  ログイン
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
                <div className="space-y-1">
                  <Label htmlFor="username">ユーザーネーム</Label>
                  <Input id="username" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-email">メールアドレス</Label>
                  <Input id="signup-email" type="email" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">パスワード</Label>
                  <Input id="signup-password" type="password" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  アカウント作成
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
