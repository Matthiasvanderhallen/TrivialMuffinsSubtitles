import Control.Monad
import System.IO

main = do
    handleEngels <- openFile "en.txt" ReadMode -- liftM (lines) $ readFile "Engelse vertaling.txt"
    handleFrans <- openFile "fr.txt" ReadMode
    handleNederlands <- openFile "nl.txt" ReadMode
    hSetEncoding handleEngels utf8_bom
    hSetEncoding handleFrans utf8_bom
    hSetEncoding handleNederlands utf8_bom
    engels <- liftM(lines) $ hGetContents handleEngels
    frans <- liftM(lines) $ hGetContents handleFrans
    nederlands <- liftM(lines) $ hGetContents handleNederlands
    let output = "nr|nederlands|frans|engels" : (zipWith3 (\a b c -> '|': a ++ "|"++ b ++ "|" ++ c) nederlands frans engels)
    writeFile "output.txt" (unlines output) -- unlines $(zipWith3 (\a b c -> a ++ b ++ c) engels frans nederlands)
    --sequence $ map (putStrLn) (unlines output)
    hClose handleEngels
    hClose handleFrans
    hClose handleNederlands
