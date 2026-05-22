import React, { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

interface TextThreeProps {
    text?: string;
    className?: string;
}

const TextThree: React.FC<TextThreeProps> = ({ text = "Namaste World!", className = "" }) => {
    const [displayText, setDisplayText] = useState("")
    const ref = React.useRef(null)
    const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

    useEffect(() => {
        // Reset text if scrolled out of view to re-trigger on next scroll
        if (!isInView) {
            setDisplayText("")
            return
        }

        let currentIndex = 0
        const intervalId = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayText(text.slice(0, currentIndex))
                currentIndex++
            } else {
                clearInterval(intervalId)
            }
        }, 70) // Adjust speed here

        return () => clearInterval(intervalId)
    }, [text, isInView])

    return (
        <div ref={ref} className="flex justify-center items-center h-full w-full">
            <motion.div
                className={className}
                style={{ fontSize: 'inherit', fontWeight: 'inherit', fontFamily: 'inherit', color: 'inherit' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {displayText}
            </motion.div>
        </div>
    )
}

export default TextThree
