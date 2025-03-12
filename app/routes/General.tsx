import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { decodeHtml } from "@/utils/decodeHtml";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export const fetchQuestions = createServerFn({
  method: "GET",
}).handler(async (): Promise<Question[]> => {
  const response = await fetch("https://opentdb.com/api.php?amount=10");
  const data = await response.json();
  return data.results;
});

// Similar to TanStack Query, data loaders are cached on the client and are re-used and even re-fetched in the background when the data is stale.
export const Route = createFileRoute("/General")({
  component: GeneralQuiz,
  loader: async () => fetchQuestions(),
});

function GeneralQuiz() {
  const navigate = useNavigate();
  const questions = Route.useLoaderData();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!questions || (questions && questions.length === 0)) {
      const interval = setInterval(async () => {
        navigate({ to: "/General", replace: true });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [questions]);

  if (!questions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    if (!questions[currentQuestion]) return;

    if (answer === questions[currentQuestion].correct_answer) {
      setScore((prev) => prev + 1);
    }
    setCurrentQuestion((prev) => prev + 1);
  };

  if (currentQuestion >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-center">
              Final Score: {score} / {questions.length}
            </p>
            <Button
              className="w-full mt-4"
              onClick={async () => {
                setCurrentQuestion(0);
                setScore(0);
                navigate({ to: "/General", replace: true });
              }}
            >
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  if (!currentQ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Question not found</p>
      </div>
    );
  }

  const answers = [...currentQ.incorrect_answers, currentQ.correct_answer].sort(
    () => Math.random() - 0.5
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Card className="w-full max-w-[600px]">
        <Link
          to="/"
          className="absolute left-4 top-4 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ArrowLeft size={24} />
        </Link>
        <CardHeader>
          <CardTitle>{decodeHtml(currentQ.category)}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{decodeHtml(currentQ.question)}</p>
          <div className="grid grid-cols-1 gap-2">
            {answers.map((answer) => (
              <Button
                key={answer}
                variant="outline"
                className="w-full"
                onClick={() => handleAnswer(answer)}
              >
                {decodeHtml(answer)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
