  <?php
defined('BASEPATH') OR exit('No direct script access allowed');

class RoomHandler {
  private static $unusedRoomIds = new SplMinHeap();
  private static $roomCount = 0;

  public static function getNewRoomId(){
    if($unusedRoomIds->count == 0){
      for($i = 0; $i < 10; $i++){
      $unuseRoomIds->insert($roomCount + $i)
    }
    $roomCount += 1;
    return $unusedRoomIds->extract();
  }

  public static function recycleRoomId($roomId)(
    $unusedRoomIds->insert($roomId);
    $roomCount -= 1;
  )

  public static function getRoomCount(){
    return $roomCount;
  }

  public static function reset(){
    private static $unusedRoomIds = new SplMinHeap();
    private static $roomCount = 0;
  }
}