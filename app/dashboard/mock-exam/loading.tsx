export default function MockExamLoading() {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Loading Mock Exam</h2>
        <p className="text-muted-foreground">Please wait while we prepare your exam...</p>
      </div>
    </div>
  )
}
