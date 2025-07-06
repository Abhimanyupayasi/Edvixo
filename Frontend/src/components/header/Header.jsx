import { useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import { UserProfile, useUser } from "@clerk/clerk-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { login } from "../../store/authSlice";
import {useDispatch, useSelector} from "react-redux"
import { selectIsLoggedIn, selectUserData } from "../../conf";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const products = [
    {
      name: "Analytics",
      description: "Get a better understanding of your traffic",
      href: "#",
      icon: ChartPieIcon,
    },
    {
      name: "Engagement",
      description: "Speak directly to your customers",
      href: "#",
      icon: CursorArrowRaysIcon,
    },
    {
      name: "Security",
      description: "Your customers’ data will be safe and secure",
      href: "#",
      icon: FingerPrintIcon,
    },
    {
      name: "Integrations",
      description: "Connect with third-party tools",
      href: "#",
      icon: SquaresPlusIcon,
    },
    {
      name: "Automations",
      description: "Build strategic funnels that will convert",
      href: "#",
      icon: ArrowPathIcon,
    },
  ];

  const callsToAction = [
    { name: "Watch demo", href: "#", icon: PlayCircleIcon },
    { name: "Contact sales", href: "#", icon: PhoneIcon },
  ];

  
  const [token , setToken] = useState(null);
  const dispatch = useDispatch();
  const { userFromClerk } = UserProfile(); 
  console.log(userFromClerk);
  
 const user = useSelector(selectUserData);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  console.log(user);
  console.log(isLoggedIn);
  
  
  
  

  useEffect(() => {
  if (user) {
    dispatch(login(user)); 
    
  }
}, [user, dispatch]);
  
  

  

  return (
    <header className="bg-[#101828] text-gray-100 border-b border-gray-700">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              alt="Company Logo"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-100"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop menu */}
        <PopoverGroup className="hidden lg:flex lg:gap-x-12">
          <Popover className="relative">
            <PopoverButton className="flex items-center gap-x-1 text-sm font-semibold text-gray-100 hover:text-white focus:outline-none">
              Product
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </PopoverButton>

            <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 overflow-hidden rounded-3xl bg-[#1A2332] shadow-lg ring-1 ring-gray-700/50">
              <div className="p-4">
                {products.map((item) => (
                  <div
                    key={item.name}
                    className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm hover:bg-gray-700"
                  >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-800 group-hover:bg-gray-700">
                      <item.icon
                        className="h-6 w-6 text-gray-300 group-hover:text-indigo-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-auto">
                      <a
                        href={item.href}
                        className="block font-semibold text-gray-100 hover:text-white"
                      >
                        {item.name}
                        <span className="absolute inset-0" />
                      </a>
                      <p className="mt-1 text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-700 bg-[#19202E]">
                {callsToAction.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold text-gray-100 hover:bg-gray-700"
                  >
                    <item.icon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
              </div>
            </PopoverPanel>
          </Popover>

          <a
            href="#"
            className="text-sm font-semibold text-gray-100 hover:text-white"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-100 hover:text-white"
          >
            Marketplace
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-gray-100 hover:text-white"
          >
            Company
          </a>
        </PopoverGroup>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <SignedOut>
            <SignInButton className="text-sm font-semibold text-gray-100 hover:text-white cursor-pointer" />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        as="div"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#101828] text-gray-100 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-700">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <img
                alt="Company Logo"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-100"
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-700">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-semibold text-gray-100 hover:bg-gray-700">
                    Product
                    <ChevronDownIcon
                      className="h-5 w-5 text-gray-400 group-data-[open]:rotate-180"
                      aria-hidden="true"
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {[...products, ...callsToAction].map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-lg px-6 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-700"
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <a
                  href="#"
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-100 hover:bg-gray-700"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-100 hover:bg-gray-700"
                >
                  Marketplace
                </a>
                <a
                  href="#"
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-100 hover:bg-gray-700"
                >
                  Company
                </a>
              </div>
              <div className="py-6">
                <SignedOut>
                  <SignInButton className="text-base font-semibold text-gray-100 hover:text-white cursor-pointer" />
                </SignedOut>
                <SignedIn>
                  <div className="border-2 border-white rounded-full p-1">
                    <UserButton className="rounded-full" />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
