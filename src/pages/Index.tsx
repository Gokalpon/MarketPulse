import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Market Pulse
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time financial market insights at your fingertips
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Market</CardTitle>
              <CardDescription>Track your favorite stocks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">+2.4%</p>
              <p className="text-sm text-muted-foreground">Today's gain</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crypto</CardTitle>
              <CardDescription>Cryptocurrency trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">$45,234</p>
              <p className="text-sm text-muted-foreground">BTC/USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forex</CardTitle>
              <CardDescription>Currency exchange rates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">1.08</p>
              <p className="text-sm text-muted-foreground">EUR/USD</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Market Pulse - Your comprehensive financial dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
