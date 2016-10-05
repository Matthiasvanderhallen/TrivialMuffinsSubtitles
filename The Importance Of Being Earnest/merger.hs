import Control.Monad
import System.IO

main = do
	handleEngels <- openFile "Engelse vertaling.txt" ReadMode -- liftM (lines) $ readFile "Engelse vertaling.txt"
	handleFrans <- openFile "Franse vertaling.txt" ReadMode
	handleNederlands <- openFile "Nederlandse vertaling.txt" ReadMode
	hSetEncoding handleEngels utf8_bom
 	hSetEncoding handleFrans utf8_bom
	hSetEncoding handleNederlands utf8_bom
	engels <- liftM(lines) $ hGetContents handleEngels
	frans <- liftM(lines) $ hGetContents handleFrans
	nederlands <- liftM(lines) $ hGetContents handleNederlands
	let output = "nr|nederlands|frans|engels" : (zipWith3 (\a b c -> a ++ b ++ c) nederlands frans engels)
	writeFile "output.txt" (unlines output) -- unlines $(zipWith3 (\a b c -> a ++ b ++ c) engels frans nederlands)
	--sequence $ map (putStrLn) (unlines output)
	hClose handleEngels
	hClose handleFrans
	hClose handleNederlands
