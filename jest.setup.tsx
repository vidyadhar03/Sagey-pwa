/**
 * jest.setup.ts
 * Loaded automatically by Jest via setupFilesAfterEnv.
 * Adds Testing-Library matchers and mocks browser-only APIs so
 * Recharts, Headless-UI, and other libs don't explode in JSDOM.
 */

/* 1️⃣  Jest-DOM matchers */
import "@testing-library/jest-dom";

/* 2️⃣  Mock ResizeObserver (required by Recharts) */
class ResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe() {/* noop */}
  unobserve() {/* noop */}
  disconnect() {/* noop */}
}
(global as any).ResizeObserver = ResizeObserver;

/* 3️⃣  Polyfill Element.getAnimations() (Headless-UI warning) */
if (!Element.prototype.getAnimations) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.getAnimations = () => [] as unknown as Animation[];
}

/* 4️⃣  Mock Recharts completely for unit tests - simple SVG stubs */
jest.mock("recharts", () => {
  const React = require("react");
  return new Proxy({}, { 
    get: () => (props: any) => <svg data-testid="RechartsMock" {...props} /> 
  });
});

/* 5️⃣  Mock Headless-UI - force synchronous transitions */
jest.mock("@headlessui/react", () => {
  const React = require("react");
  
  const Transition = ({ children, show = true, appear = true }: any) => {
    // Only render if show is true (appear is just for initial animation)
    return show ? <>{children}</> : null;
  };
  
  Transition.Child = ({ children }: any) => <>{children}</>;
  
  const Dialog = ({ children, onClose }: any) => {
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [onClose]);
    
    // Transition handles visibility, Dialog always renders when present
    return <div role="dialog">{children}</div>;
  };
  
  Dialog.Panel = ({ children }: any) => <div>{children}</div>;
  Dialog.Title = ({ children, as: Component = 'h3' }: any) => <Component>{children}</Component>;
  
  const Switch = React.forwardRef(({ checked, onChange, children, ...props }: any, ref: any) => (
    <button
      {...props}
      ref={ref}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      {children}
    </button>
  ));
  Switch.displayName = 'Switch';
  
  return {
    Transition,
    Dialog,
    Switch,
  };
});

/* 6️⃣  Mock html2canvas - lightweight promise mock */
jest.mock("html2canvas", () =>
  jest.fn(() => Promise.resolve({ toDataURL: () => "data:image/png;base64,AAA" }))
);

/* 7️⃣  Mock lucide-react icons to lightweight <svg> */
jest.mock("lucide-react", () => {
  const React = require("react");
  const icons = {
    TrendingUp: (props: any) => <svg data-testid="trending-up-icon" {...props} />,
    TrendingDown: (props: any) => <svg data-testid="trending-down-icon" {...props} />,
  };

  return new Proxy(icons, {
    get: (target, prop) => {
      // If we have a specific mock, return it
      if (prop in target) {
        return target[prop as keyof typeof icons];
      }
      
      // Otherwise, return a generic icon
      return ({ className, ...rest }: { className?: string }) => (
        <svg
          role="img"
          data-testid="lucide-icon"
          width="1em"
          height="1em"
          className={className}
          {...rest}
        />
      );
    },
  });
}); 