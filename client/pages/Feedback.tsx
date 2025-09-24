import Layout from "@/components/layout/Layout";
import { Icon } from "@iconify/react";
import { Send } from "lucide-react";
import { useState } from "react";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, feedback })
      });
      
      if (response.ok) {
        setSent(true);
        setFeedback("");
        setEmail("");
        setName("");
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send feedback:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Icon icon="mdi:message-text" className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Share Your Feedback
          </h1>
          <p className="text-xl text-muted-foreground">
            Help us improve JavaRanker! Your thoughts and suggestions matter to us.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-card border rounded-2xl p-8 shadow-lg">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="mdi:check-circle" className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-3">Thank You!</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Your feedback has been sent successfully to javarankers@gmail.com
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Send Another Feedback
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">We'd Love to Hear From You</h2>
                <p className="text-muted-foreground">
                  Whether it's a bug report, feature request, or general feedback about your experience with JavaRanker, 
                  we're here to listen and improve.
                </p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40 resize-none"
                    placeholder="Share your thoughts, suggestions, bug reports, or any other feedback..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Please be as detailed as possible to help us understand your feedback better.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                >
                  {sending ? (
                    <>
                      <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                      Sending Feedback...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Feedback to javarankers@gmail.com
                    </>
                  )}
                </button>
              </form>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-semibold mb-3">Other Ways to Reach Us</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Icon icon="mdi:email" className="w-4 h-4" />
                    Direct Email: javarankers@gmail.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Icon icon="mdi:clock" className="w-4 h-4" />
                    Response Time: Usually within 24-48 hours
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}