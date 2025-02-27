import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { decodeHtml } from "@/utils/decodeHtml";
import { ArrowLeft } from "lucide-react";

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const getQuestions = createServerFn({
  method: "GET",
}).handler(async () => {
  const response = await fetch("https://opentdb.com/api.php?amount=10");
  const data = await response.json();
  return data.results as Question[];
});

export const Route = createFileRoute("/General")({
  component: GeneralQuiz,
  loader: async () => {
    const questions = await getQuestions();
    // Cache the questions in sessionStorage
    sessionStorage.setItem("quizQuestions", JSON.stringify(questions));
    return questions;
  },
});

function GeneralQuiz() {
  const navigate = useNavigate();
  const loaderQuestions = Route.useLoaderData();
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const cached = sessionStorage.getItem("quizQuestions");
      return cached ? JSON.parse(cached) : loaderQuestions;
    } catch (error) {
      return loaderQuestions;
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  console.log("questions", questions);

  useEffect(() => {
    if (loaderQuestions && Array.isArray(loaderQuestions)) {
      setQuestions(loaderQuestions);
    }
  }, [loaderQuestions]);

  // Early return for loading state
  if (!questions || !Array.isArray(questions)) {
    try {
      const cached = sessionStorage.getItem("quizQuestions");
      if (cached) {
        const parsedQuestions = JSON.parse(cached);
        setQuestions(parsedQuestions);
      }
    } catch (error) {
      console.error("Error parsing cached questions:", error);
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading questions...</p>
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
                // Clear current questions from session storage
                sessionStorage.removeItem("quizQuestions");
                // Reset states
                setCurrentQuestion(0);
                setScore(0);
                // Reload the route to fetch new questions
                await navigate({ to: "/General", replace: true });
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
