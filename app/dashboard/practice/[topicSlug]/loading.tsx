export default function TopicPracticeLoading() {
  return (
    <div className="container mx-auto py-8 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading practice session...</p>
      </div>
    </div>
  )
}
