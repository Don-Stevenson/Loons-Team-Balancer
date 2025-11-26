import { PulseLoader } from 'react-spinners'

const primaryStyles =
  'font-medium py-1 px-2 sm:w-auto min-w-[150px] max-w-[200px] rounded text-center items-center h-[35px] flex justify-center hover:cursor-pointer bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'

const secondaryStyles =
  'font-medium py-1 px-2 sm:w-auto min-w-[150px] max-w-[200px] rounded text-center items-center h-[35px] flex justify-center hover:cursor-pointer border border-gray-400 text-center rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50'

const tertiaryStyles =
  'border border-gray-300 text-black flex items-center justify-center text-[0.62rem] font-medium p-[0.15rem] rounded h-[2.5rem] w-[2.50rem] bg-white hover:bg-gray-200 border border-gray-300'

const quaternaryStyles =
  'border border-gray-300 text-black flex items-center justify-center text-[0.62rem] font-medium p-[0.15rem] rounded h-[2.5rem] w-[2.50rem] bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900'
const logoutStyles =
  'bg-loonsRed hover:bg-red-900 text-loonsBeige border border-red-900 font-semibold py-2 px-3 rounded text-center whitespace-nowrap transition-colors text-lg md:text-sm'

const getVariantStyles = variant => {
  if (variant === 'primary') {
    return primaryStyles
  } else if (variant === 'secondary') {
    return secondaryStyles
  } else if (variant === 'tertiary') {
    return tertiaryStyles
  } else if (variant === 'quaternary') {
    return quaternaryStyles
  } else if (variant === 'logout') {
    return logoutStyles
  }
}

export const Button = ({
  variant,
  isLoading,
  text,
  loadingMessage,
  classes,
  onClick,
  testId,
  disabled,
}) => {
  return (
    <div
      className={`${getVariantStyles(variant)} ${classes}`}
      onClick={onClick}
      data-testid="button-container"
    >
      <button disabled={isLoading || disabled} data-testid={testId}>
        {isLoading ? (
          <div className="flex justify-center items-center gap-2 py-4">
            {loadingMessage}
            {variant === 'primary' || variant === 'delete' ? (
              <PulseLoader color="white" size={6} />
            ) : (
              <PulseLoader color="gray" size={6} />
            )}
          </div>
        ) : (
          text
        )}
      </button>
    </div>
  )
}
