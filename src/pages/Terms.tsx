import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Whitestones Markets. By accessing and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Account Registration</h2>
            <p className="text-muted-foreground">
              To use our services, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Investment Services</h2>
            <p className="text-muted-foreground">
              Our platform provides investment opportunities in various financial instruments. All investments carry risk, and past performance does not guarantee future results. You should only invest funds that you can afford to lose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Deposits and Withdrawals</h2>
            <p className="text-muted-foreground">
              Deposits and withdrawals are subject to our processing policies and may take several business days to complete. We reserve the right to request additional verification before processing withdrawal requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. KYC and Compliance</h2>
            <p className="text-muted-foreground">
              In compliance with regulatory requirements, we may request Know Your Customer (KYC) documentation to verify your identity. Failure to provide requested documents may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <p className="text-muted-foreground">
              You agree not to engage in any fraudulent, abusive, or illegal activities on our platform. This includes but is not limited to money laundering, market manipulation, or unauthorized access to other users' accounts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Whitestones Markets shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount of fees paid by you in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms and Conditions at any time. Continued use of our platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms and Conditions, please contact us through our support channels.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
