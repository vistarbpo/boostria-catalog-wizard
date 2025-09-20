import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  CreditCard, 
  Settings, 
  Package, 
  Rss, 
  AlertCircle, 
  BookOpen,
  MessageCircle,
  FileText,
  Upload,
  PlayCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

const categories = [
  { id: "getting-started", name: "Getting Started", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
  { id: "billing", name: "Billing", icon: CreditCard, color: "bg-green-500/10 text-green-600" },
  { id: "credits-plans", name: "Credits & Plans", icon: Settings, color: "bg-purple-500/10 text-purple-600" },
  { id: "catalog-setup", name: "Catalog Setup", icon: Package, color: "bg-orange-500/10 text-orange-600" },
  { id: "feed-outputs", name: "Feed Outputs", icon: Rss, color: "bg-cyan-500/10 text-cyan-600" },
  { id: "technical", name: "Technical Issues", icon: AlertCircle, color: "bg-red-500/10 text-red-600" }
];

const faqItems = [
  {
    question: "How do credits work?",
    category: "credits-plans",
    answer: "Credits are used for catalog processing, template generation, and feed updates. Monthly credits reset on your renewal date."
  },
  {
    question: "How do I add manual images/videos?",
    category: "catalog-setup", 
    answer: "Go to Media Manager, select your catalog, and use the upload button to add custom media files."
  },
  {
    question: "How do I update feed links?",
    category: "feed-outputs",
    answer: "In Feed Manager, select your catalog and click 'Update Feeds' to regenerate all platform-specific URLs."
  },
  {
    question: "Billing & subscription issues",
    category: "billing",
    answer: "Visit the Billing page to manage your subscription, update payment methods, or view invoices."
  }
];

const mockTickets = [
  {
    id: "T-001",
    subject: "Feed not updating properly",
    status: "in-progress" as const,
    created: "2024-01-15",
    lastUpdate: "2024-01-16"
  },
  {
    id: "T-002", 
    subject: "Billing question about credits",
    status: "resolved" as const,
    created: "2024-01-10",
    lastUpdate: "2024-01-12"
  }
];

const tutorials = [
  {
    title: "Getting Started Guide",
    description: "Complete walkthrough of setting up your first catalog",
    type: "video",
    duration: "12 min",
    url: "#"
  },
  {
    title: "Feed Configuration",
    description: "How to configure feeds for different platforms", 
    type: "docs",
    url: "#"
  },
  {
    title: "Advanced Templates",
    description: "Creating custom templates for your products",
    type: "video", 
    duration: "8 min",
    url: "#"
  }
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    file: null as File | null
  });

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", contactForm);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-500/10 text-green-600";
      case "in-progress": return "bg-orange-500/10 text-orange-600"; 
      case "open": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return CheckCircle;
      case "in-progress": return Clock;
      case "open": return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
        <p className="text-muted-foreground">Get help, find answers, and contact our support team</p>
      </div>

      {/* Search Bar - Sticky */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles, FAQs, and documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Help & FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Help Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        selectedCategory === category.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center mb-2 mx-auto`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-center">{category.name}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No FAQ items match your search criteria.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tutorials & Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Tutorials & Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tutorials.map((tutorial, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {tutorial.type === 'video' ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{tutorial.title}</h4>
                        <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                        {tutorial.duration && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {tutorial.duration}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact & Tickets */}
        <div className="space-y-6">
          {/* Contact Support Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Please describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="file">Attachment (optional)</Label>
                  <div className="mt-1">
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setContactForm(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mockTickets.length > 0 ? (
                <div className="space-y-3">
                  {mockTickets.map((ticket) => {
                    const StatusIcon = getStatusIcon(ticket.status);
                    return (
                      <div key={ticket.id} className="border border-border rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-foreground">{ticket.subject}</p>
                            <p className="text-xs text-muted-foreground">#{ticket.id}</p>
                          </div>
                          <Badge className={getStatusColor(ticket.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>Created: {ticket.created}</p>
                          <p>Updated: {ticket.lastUpdate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No support tickets yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}