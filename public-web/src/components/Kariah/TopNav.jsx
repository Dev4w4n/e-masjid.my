export default function TopNav({ step }) {

  const renderTickSVG = (currentNavItem) => {
    const svgTick = (
      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
      </svg>
    )
    switch (currentNavItem) {
      case 1:
        if (step > 1) {
          return svgTick
        }
        break
      case 2:
        if (step > 3) {
          return svgTick
        }
        break
      case 3:
        if (step > 4) {
          return svgTick
        }
        break
      default:
        return '';
    }
  }
  const getNavItemClass = (currentNavItem) => {
    const activeClass = "flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
    const inactiveClass = "flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700'"
    const activeLastClass = "flex items-center text-blue-600 dark:text-blue-500"
    const inactiveLastClass = "flex items-center"

    switch (currentNavItem) {
      case 1:
        if (step === 1) {
          return activeClass
        } else {
          return inactiveClass
        }
      case 2:
        if (step === 2 || (step > 1 && step < 4)) {
          return activeClass
        } else {
          return inactiveClass
        }
      case 3:
        if (step === 4) {
          return activeLastClass
        } else {
          return inactiveLastClass
        }
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  }

  return (
    <>
      <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
        <li className={getNavItemClass(1)}>
          <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            {renderTickSVG(1)}
            <span class="me-2">1.</span>
            Perakuan
          </span>
        </li>
        <li className={getNavItemClass(2)}>
          <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
            {renderTickSVG(2)}
            <span class="me-2">2.</span>
            Pendaftaran
          </span>
        </li>
        <li className={getNavItemClass(3)}>
          {renderTickSVG(3)}
          <span class="me-2">3.</span>
          Pengesahan
        </li>
      </ol>
    </>
  );
}